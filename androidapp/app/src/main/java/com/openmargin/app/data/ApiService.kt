package com.openmargin.app.data

import kotlinx.serialization.json.JsonObject
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.PartMap
import retrofit2.http.Path
import retrofit2.http.Query

// One function per route in nodeapp/src/router. A null @Query or @Part is left out of the request.
interface ApiService {

    // ---- Auth ----

    @POST("api/auth/login")
    suspend fun login(@Body body: LoginInput): ApiEnvelope<AuthData>

    @Multipart
    @POST("api/auth/signup")
    suspend fun signup(
        @PartMap fields: Map<String, @JvmSuppressWildcards RequestBody>,
        @Part avatar: MultipartBody.Part,
    ): ApiEnvelope<UserData>

    @POST("api/auth/forgot-password")
    suspend fun forgotPassword(@Body body: EmailInput): ApiEnvelope<ResetCodeData>

    @POST("api/auth/reset-password")
    suspend fun resetPassword(@Body body: ResetInput): ApiEnvelope<JsonObject>

    @GET("api/auth/me")
    suspend fun me(): ApiEnvelope<UserData>

    // ---- Users ----

    @Multipart
    @PATCH("api/users/me")
    suspend fun updateMe(
        @PartMap fields: Map<String, @JvmSuppressWildcards RequestBody>,
        @Part avatar: MultipartBody.Part?,
    ): ApiEnvelope<UserData>

    @GET("api/users/{id}")
    suspend fun author(@Path("id") id: String): ApiEnvelope<AuthorData>

    // ---- Categories and tags ----

    @GET("api/categories")
    suspend fun categories(): ApiEnvelope<CategoryList>

    @POST("api/categories")
    suspend fun createCategory(@Body body: CategoryInput): ApiEnvelope<CategoryData>

    @PATCH("api/categories/{id}")
    suspend fun updateCategory(@Path("id") id: String, @Body body: CategoryInput): ApiEnvelope<CategoryData>

    @DELETE("api/categories/{id}")
    suspend fun deleteCategory(@Path("id") id: String): ApiEnvelope<JsonObject>

    @GET("api/tags")
    suspend fun tags(@Query("search") search: String?): ApiEnvelope<TagList>

    // ---- Posts ----

    @GET("api/posts")
    suspend fun posts(
        @Query("search") search: String? = null,
        @Query("category") category: String? = null,
        @Query("tag") tag: String? = null,
        @Query("author") author: String? = null,
        @Query("sort") sort: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 12,
    ): ApiEnvelope<PostList>

    @GET("api/posts/{slug}")
    suspend fun post(@Path("slug") slug: String): ApiEnvelope<PostData>

    @GET("api/posts/mine")
    suspend fun myPosts(
        @Query("status") status: String?,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 12,
    ): ApiEnvelope<PostList>

    @GET("api/posts/mine/{id}")
    suspend fun myPost(@Path("id") id: String): ApiEnvelope<PostData>

    @POST("api/posts")
    suspend fun createPost(@Body body: PostInput): ApiEnvelope<PostData>

    @PATCH("api/posts/{id}")
    suspend fun updatePost(@Path("id") id: String, @Body body: PostInput): ApiEnvelope<PostData>

    @DELETE("api/posts/{id}")
    suspend fun deletePost(@Path("id") id: String): ApiEnvelope<JsonObject>

    @POST("api/posts/{id}/publish")
    suspend fun publishPost(@Path("id") id: String): ApiEnvelope<PostData>

    @POST("api/posts/{id}/unpublish")
    suspend fun unpublishPost(@Path("id") id: String): ApiEnvelope<PostData>

    @Multipart
    @POST("api/posts/{id}/cover")
    suspend fun setCover(@Path("id") id: String, @Part cover: MultipartBody.Part): ApiEnvelope<PostData>

    // ---- Likes and comments ----

    @GET("api/posts/{id}/like")
    suspend fun like(@Path("id") id: String): ApiEnvelope<LikeState>

    @POST("api/posts/{id}/like")
    suspend fun toggleLike(@Path("id") id: String): ApiEnvelope<LikeState>

    @GET("api/posts/{id}/comments")
    suspend fun comments(
        @Path("id") id: String,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
    ): ApiEnvelope<CommentList>

    @POST("api/posts/{id}/comments")
    suspend fun addComment(@Path("id") id: String, @Body body: CommentInput): ApiEnvelope<CommentData>

    @DELETE("api/comments/{id}")
    suspend fun deleteComment(@Path("id") id: String): ApiEnvelope<JsonObject>

    @POST("api/reports")
    suspend fun report(@Body body: ReportInput): ApiEnvelope<JsonObject>

    // ---- AI assistant ----

    @GET("api/ai/usage")
    suspend fun aiUsage(): ApiEnvelope<AiUsage>

    @POST("api/ai/titles")
    suspend fun aiTitles(@Body body: AiDraftInput): ApiEnvelope<AiTitles>

    @POST("api/ai/summary")
    suspend fun aiSummary(@Body body: AiDraftInput): ApiEnvelope<AiSummary>

    @POST("api/ai/tags")
    suspend fun aiTags(@Body body: AiDraftInput): ApiEnvelope<AiTags>

    @POST("api/ai/improve")
    suspend fun aiImprove(@Body body: AiParagraphInput): ApiEnvelope<AiImprove>

    // ---- Admin ----

    @GET("api/admin/reports")
    suspend fun adminReports(
        @Query("status") status: String,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
    ): ApiEnvelope<ReportList>

    @PATCH("api/admin/reports/{id}/resolve")
    suspend fun resolveReport(@Path("id") id: String, @Body body: ResolveInput): ApiEnvelope<ReportData>

    @GET("api/admin/users")
    suspend fun adminUsers(
        @Query("status") status: String?,
        @Query("search") search: String?,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
    ): ApiEnvelope<AdminUserList>

    @PATCH("api/admin/users/{id}/block")
    suspend fun blockUser(@Path("id") id: String): ApiEnvelope<JsonObject>

    @PATCH("api/admin/users/{id}/unblock")
    suspend fun unblockUser(@Path("id") id: String): ApiEnvelope<JsonObject>
}
