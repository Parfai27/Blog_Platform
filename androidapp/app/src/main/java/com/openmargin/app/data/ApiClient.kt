package com.openmargin.app.data

import com.openmargin.app.BuildConfig
import java.io.IOException
import java.util.concurrent.TimeUnit
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.HttpException
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory

class ApiException(message: String, val code: Int = 0) : Exception(message)

object ApiClient {
    val json = Json {
        ignoreUnknownKeys = true
        explicitNulls = false
        coerceInputValues = true
    }

    fun create(session: SessionStore): ApiService {
        val client = OkHttpClient.Builder()
            .addInterceptor { chain ->
                val token = session.token
                val request = if (token == null) {
                    chain.request()
                } else {
                    chain.request().newBuilder().header("Authorization", "Bearer $token").build()
                }
                chain.proceed(request)
            }
            .apply {
                if (BuildConfig.DEBUG) {
                    addInterceptor(HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BASIC })
                }
            }
            .connectTimeout(15, TimeUnit.SECONDS)
            // The AI routes can take a while.
            .readTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(60, TimeUnit.SECONDS)
            .build()

        return Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(client)
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
            .build()
            .create(ApiService::class.java)
    }
}

// Runs one API call and turns failures into ApiException with the server's message.
suspend fun <T> request(block: suspend ApiService.() -> ApiEnvelope<T>): Result<ApiEnvelope<T>> {
    return try {
        Result.success(AppGraph.api.block())
    } catch (error: HttpException) {
        val body = error.response()?.errorBody()?.string()
        val message = body
            ?.let { runCatching { ApiClient.json.decodeFromString(ErrorBody.serializer(), it).message }.getOrNull() }
            ?: "Request failed (${error.code()})"
        // An expired token or a deleted account: drop the session so the app shows the logged-out state.
        if (error.code() == 401 && AppGraph.session.token != null) AppGraph.session.clear()
        Result.failure(ApiException(message, error.code()))
    } catch (error: IOException) {
        Result.failure(ApiException("Can't reach the server. Check that the API is running at ${BuildConfig.API_BASE_URL}"))
    } catch (error: SerializationException) {
        Result.failure(ApiException("The server sent a reply the app could not read"))
    }
}

// Same as request, but gives back data only and fails if it is missing.
suspend fun <T> requestData(block: suspend ApiService.() -> ApiEnvelope<T>): Result<T> =
    request(block).mapCatching { it.data ?: throw ApiException(it.message ?: "The server sent an empty reply") }
