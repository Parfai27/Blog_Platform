package com.openmargin.app.data

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import java.io.ByteArrayOutputStream
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.toRequestBody

fun textPart(value: String): RequestBody = value.toRequestBody("text/plain".toMediaType())

// Phone photos are often larger than the API allows (2 MB avatar, 5 MB cover),
// so every picked image is scaled down and sent as JPEG.
suspend fun imagePart(field: String, uri: Uri, maxSide: Int = 1600): MultipartBody.Part = withContext(Dispatchers.IO) {
    val resolver = AppGraph.appContext.contentResolver

    val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    resolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, bounds) }
    if (bounds.outWidth <= 0 || bounds.outHeight <= 0) throw ApiException("Could not read that image")

    var sample = 1
    while (maxOf(bounds.outWidth, bounds.outHeight) / (sample * 2) >= maxSide) sample *= 2

    val decoded = resolver.openInputStream(uri)?.use {
        BitmapFactory.decodeStream(it, null, BitmapFactory.Options().apply { inSampleSize = sample })
    } ?: throw ApiException("Could not read that image")

    val scale = maxSide.toFloat() / maxOf(decoded.width, decoded.height)
    val bitmap = if (scale < 1f) {
        Bitmap.createScaledBitmap(decoded, (decoded.width * scale).toInt(), (decoded.height * scale).toInt(), true)
    } else {
        decoded
    }

    val bytes = ByteArrayOutputStream().use { out ->
        bitmap.compress(Bitmap.CompressFormat.JPEG, 85, out)
        out.toByteArray()
    }
    MultipartBody.Part.createFormData(field, "$field.jpg", bytes.toRequestBody("image/jpeg".toMediaType()))
}
