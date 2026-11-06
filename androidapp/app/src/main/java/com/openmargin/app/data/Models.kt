package com.openmargin.app.data

import kotlinx.serialization.Serializable

// Every API reply is { success, message?, data? }.
@Serializable
data class ApiEnvelope<T>(
    val success: Boolean = false,
    val message: String? = null,
    val data: T? = null,
)

@Serializable
data class ErrorBody(val message: String? = null)

@Serializable
data class Image(val url: String = "", val publicId: String = "")

@Serializable
data class Pagination(val page: Int = 1, val limit: Int = 12, val total: Int = 0, val pages: Int = 0)

// ---- Users and auth ----

@Serializable
data class User(
    val id: String,
    val firstName: String = "",
    val lastName: String = "",
    val email: String = "",
    val role: String = "author",
    val bio: String = "",
    val avatar: Image? = null,
    val isBlocked: Boolean = false,
) {
    val isAdmin: Boolean get() = role == "admin"
    val fullName: String get() = "$firstName $lastName".trim()
}

@Serializable
data class AuthData(val token: String, val user: User)

@Serializable
data class UserData(val user: User)

@Serializable
data class ResetCodeData(val resetCode: String? = null)

@Serializable
data class LoginInput(val email: String, val password: String)

@Serializable
data class EmailInput(val email: String)

@Serializable
data class ResetInput(val email: String, val code: String, val newPassword: String)

@Serializable
data class AuthorProfile(
    val id: String,
    val firstName: String = "",
    val lastName: String = "",
    val bio: String = "",
    val avatar: String = "",
    val joinedAt: String? = null,
    val postCount: Int = 0,
    val likeCount: Int = 0,
) {
    val fullName: String get() = "$firstName $lastName".trim()
}

@Serializable
data class AuthorData(val author: AuthorProfile)

// ---- Posts ----

@Serializable
data class Named(val id: String, val name: String = "", val slug: String = "")

@Serializable
data class PostAuthor(
    val id: String,
    val firstName: String = "",
    val lastName: String = "",
    val avatar: String = "",
) {
    val fullName: String get() = "$firstName $lastName".trim()
}

@Serializable
data class Post(
    val id: String,
    val title: String = "",
    val slug: String = "",
    val excerpt: String = "",
    // Lists leave the body out. The post page and the editor get it.
    val body: String? = null,
    val coverImage: Image? = null,
    val category: Named? = null,
    val tags: List<Named> = emptyList(),
    val author: PostAuthor? = null,
    val status: String = "draft",
    val publishedAt: String? = null,
    val readTime: Int = 1,
    val likeCount: Int = 0,
    val commentCount: Int = 0,
    val createdAt: String? = null,
    val updatedAt: String? = null,
) {
    val isPublished: Boolean get() = status == "published"
}

@Serializable
data class PostList(val posts: List<Post> = emptyList(), val pagination: Pagination = Pagination())

@Serializable
data class PostData(val post: Post)

// A field left null is not sent, so it stays unchanged. category "" clears it.
@Serializable
data class PostInput(
    val title: String? = null,
    val excerpt: String? = null,
    val body: String? = null,
    val category: String? = null,
    val tags: List<String>? = null,
)

@Serializable
data class Category(
    val id: String,
    val name: String = "",
    val slug: String = "",
    val description: String = "",
    val postCount: Int? = null,
)

@Serializable
data class CategoryList(val categories: List<Category> = emptyList())

@Serializable
data class CategoryData(val category: Category)

@Serializable
data class CategoryInput(val name: String? = null, val description: String? = null)

@Serializable
data class TagList(val tags: List<Named> = emptyList())

// ---- Likes, comments, reports ----

@Serializable
data class LikeState(val liked: Boolean = false, val likeCount: Int = 0)

@Serializable
data class Comment(
    val id: String,
    val body: String = "",
    val author: PostAuthor? = null,
    val createdAt: String? = null,
)

@Serializable
data class CommentList(val comments: List<Comment> = emptyList(), val pagination: Pagination = Pagination())

@Serializable
data class CommentData(val comment: Comment)

@Serializable
data class CommentInput(val body: String)

@Serializable
data class ReportInput(val targetType: String, val targetId: String, val reason: String, val details: String)

// Same keys and labels as REPORT_REASONS in nodeapp/src/model/report.model.ts.
val REPORT_REASONS = listOf(
    "spam" to "Spam or advertising",
    "harassment" to "Harassment or hate",
    "misleading" to "False or misleading",
    "sexual_violent" to "Sexual or violent content",
    "other" to "Other",
)

const val COMMENT_MAX = 1000
const val REPORT_DETAILS_MAX = 500
const val TITLE_MAX = 150
const val EXCERPT_MAX = 300
const val BODY_MAX = 50000
const val TAGS_MAX = 5
const val BIO_MAX = 280
const val NAME_MAX = 40

// ---- AI assistant ----

@Serializable
data class AiUsage(val used: Int = 0, val limit: Int = 0, val remaining: Int = 0)

@Serializable
data class AiDraftInput(val draft: String, val title: String, val existingTags: List<String>? = null)

@Serializable
data class AiParagraphInput(val paragraph: String)

@Serializable
data class AiTitles(val titles: List<String> = emptyList(), val usage: AiUsage? = null, val mock: Boolean = false)

@Serializable
data class AiSummary(val summary: String = "", val usage: AiUsage? = null, val mock: Boolean = false)

@Serializable
data class AiTags(val tags: List<String> = emptyList(), val usage: AiUsage? = null, val mock: Boolean = false)

@Serializable
data class AiImprove(val improved: String = "", val usage: AiUsage? = null, val mock: Boolean = false)

// ---- Admin ----

@Serializable
data class Person(val id: String, val name: String = "", val isBlocked: Boolean? = null)

@Serializable
data class Report(
    val id: String,
    val status: String = "open",
    val targetType: String = "post",
    val targetId: String = "",
    val preview: String = "",
    val postTitle: String = "",
    val reason: String = "",
    val reasonLabel: String = "",
    val details: String = "",
    val reporter: Person? = null,
    val targetAuthor: Person? = null,
    val actions: List<String> = emptyList(),
    val resolvedBy: Person? = null,
    val resolvedAt: String? = null,
    val createdAt: String? = null,
)

@Serializable
data class ReportCounts(val open: Int = 0, val resolved: Int = 0, val all: Int = 0)

@Serializable
data class ReportList(
    val reports: List<Report> = emptyList(),
    val counts: ReportCounts = ReportCounts(),
    val pagination: Pagination = Pagination(),
)

@Serializable
data class ReportData(val report: Report)

@Serializable
data class ResolveInput(val removeContent: Boolean, val blockUser: Boolean)

@Serializable
data class AdminUser(
    val id: String,
    val firstName: String = "",
    val lastName: String = "",
    val email: String = "",
    val role: String = "author",
    val isBlocked: Boolean = false,
    val postCount: Int = 0,
    val joinedAt: String? = null,
) {
    val fullName: String get() = "$firstName $lastName".trim()
}

@Serializable
data class AdminUserList(val users: List<AdminUser> = emptyList(), val pagination: Pagination = Pagination())
