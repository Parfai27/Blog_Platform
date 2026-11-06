package com.openmargin.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.outlined.ChatBubbleOutline
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.AssistChip
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.openmargin.app.data.AppGraph
import com.openmargin.app.data.COMMENT_MAX
import com.openmargin.app.data.Comment
import com.openmargin.app.data.CommentInput
import com.openmargin.app.data.Post
import com.openmargin.app.data.REPORT_DETAILS_MAX
import com.openmargin.app.data.REPORT_REASONS
import com.openmargin.app.data.ReportInput
import com.openmargin.app.data.request
import com.openmargin.app.data.requestData
import com.openmargin.app.ui.Routes
import com.openmargin.app.ui.components.Avatar
import com.openmargin.app.ui.components.CenteredLoading
import com.openmargin.app.ui.components.MessageBox
import com.openmargin.app.ui.components.ScreenScaffold
import com.openmargin.app.ui.components.formatDate
import com.openmargin.app.ui.components.rememberToast
import com.openmargin.app.ui.theme.ArticleBody
import kotlinx.coroutines.launch

class PostViewModel(private val slug: String) : ViewModel() {
    var post by mutableStateOf<Post?>(null)
        private set
    var loadError by mutableStateOf<String?>(null)
        private set
    var liked by mutableStateOf(false)
        private set
    var likeCount by mutableIntStateOf(0)
        private set
    var comments by mutableStateOf<List<Comment>>(emptyList())
        private set
    var commentTotal by mutableIntStateOf(0)
        private set
    var commentsLoading by mutableStateOf(false)
        private set
    var commentsError by mutableStateOf<String?>(null)
        private set

    private var commentPage = 0
    private var commentPages = 1
    val moreComments: Boolean get() = commentPage < commentPages

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            loadError = null
            requestData { post(slug) }
                .onSuccess {
                    post = it.post
                    likeCount = it.post.likeCount
                    commentTotal = it.post.commentCount
                    if (AppGraph.session.token != null) {
                        requestData { like(it.post.id) }.onSuccess { state ->
                            liked = state.liked
                            likeCount = state.likeCount
                        }
                    }
                    commentPage = 0
                    comments = emptyList()
                    loadMoreComments()
                }
                .onFailure { loadError = it.message }
        }
    }

    fun loadMoreComments() {
        val id = post?.id ?: return
        if (commentsLoading) return
        viewModelScope.launch {
            commentsLoading = true
            commentsError = null
            requestData { comments(id, commentPage + 1) }
                .onSuccess {
                    comments = comments + it.comments
                    commentPage = it.pagination.page
                    commentPages = it.pagination.pages
                    commentTotal = it.pagination.total
                }
                .onFailure { commentsError = it.message }
            commentsLoading = false
        }
    }

    suspend fun toggleLike(): Result<Unit> {
        val id = post?.id ?: return Result.success(Unit)
        // Show the change right away, then settle on the server's count.
        val before = liked to likeCount
        liked = !liked
        likeCount += if (liked) 1 else -1
        return requestData { toggleLike(id) }
            .onSuccess {
                liked = it.liked
                likeCount = it.likeCount
            }
            .onFailure {
                liked = before.first
                likeCount = before.second
            }
            .map { }
    }

    suspend fun addComment(body: String): Result<Unit> {
        val id = post?.id ?: return Result.success(Unit)
        return requestData { addComment(id, CommentInput(body.trim())) }
            .onSuccess {
                // The thread is oldest first; only show the new one if the last page is already loaded.
                if (!moreComments) comments = comments + it.comment
                commentTotal += 1
            }
            .map { }
    }

    suspend fun deleteComment(comment: Comment): Result<String> =
        request { deleteComment(comment.id) }
            .onSuccess {
                comments = comments.filterNot { it.id == comment.id }
                commentTotal = (commentTotal - 1).coerceAtLeast(0)
            }
            .map { it.message ?: "Comment deleted" }

    suspend fun report(targetType: String, targetId: String, reason: String, details: String): Result<String> =
        request { report(ReportInput(targetType, targetId, reason, details.trim())) }
            .map { it.message ?: "Thanks. An admin will review your report." }

    suspend fun deletePost(): Result<String> {
        val id = post?.id ?: return Result.failure(IllegalStateException("No post"))
        return request { deletePost(id) }.map { it.message ?: "Post deleted" }
    }
}

private data class ReportTarget(val type: String, val id: String)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun PostScreen(slug: String, nav: NavController) {
    val vm: PostViewModel = viewModel(key = "post-$slug") { PostViewModel(slug) }
    val session by AppGraph.session.state.collectAsStateWithLifecycle()
    val me = session?.user
    val post = vm.post
    val scope = rememberCoroutineScope()
    val toast = rememberToast()
    var menu by remember { mutableStateOf(false) }
    var reportTarget by remember { mutableStateOf<ReportTarget?>(null) }
    var confirmDelete by remember { mutableStateOf(false) }
    var commentText by rememberSaveable { mutableStateOf("") }
    var sending by remember { mutableStateOf(false) }

    val isOwner = post != null && me != null && post.author?.id == me.id
    val requireLogin: () -> Unit = {
        toast("Log in first")
        nav.navigate(Routes.LOGIN)
    }

    ScreenScaffold(
        title = {},
        onBack = { nav.popBackStack() },
        actions = actions@{
            if (post == null) return@actions
            if (isOwner) {
                IconButton(onClick = { nav.navigate(Routes.editor(post.id)) }) {
                    Icon(Icons.Default.Edit, contentDescription = "Edit")
                }
            }
            IconButton(onClick = { menu = true }) { Icon(Icons.Default.MoreVert, contentDescription = "More") }
            DropdownMenu(expanded = menu, onDismissRequest = { menu = false }) {
                if (!isOwner) {
                    DropdownMenuItem(text = { Text("Report story") }, onClick = {
                        menu = false
                        if (me == null) requireLogin() else reportTarget = ReportTarget("post", post.id)
                    })
                }
                if (isOwner || me?.isAdmin == true) {
                    DropdownMenuItem(text = { Text("Delete story") }, onClick = {
                        menu = false
                        confirmDelete = true
                    })
                }
            }
        },
    ) { modifier ->
        when {
            vm.loadError != null -> MessageBox(vm.loadError!!, modifier, actionLabel = "Try again", onAction = vm::load)
            post == null -> CenteredLoading(modifier)
            else -> LazyColumn(modifier.fillMaxSize()) {
                item(key = "article") {
                    Column(Modifier.padding(horizontal = 20.dp)) {
                        post.category?.let {
                            Text(
                                it.name.uppercase(),
                                style = MaterialTheme.typography.labelLarge,
                                color = MaterialTheme.colorScheme.primary,
                                fontWeight = FontWeight.Bold,
                            )
                            Spacer(Modifier.height(6.dp))
                        }
                        Text(post.title, style = MaterialTheme.typography.headlineLarge)
                        if (post.excerpt.isNotBlank()) {
                            Spacer(Modifier.height(8.dp))
                            Text(post.excerpt, style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Spacer(Modifier.height(16.dp))
                        post.author?.let { author ->
                            Row(
                                Modifier.clickable { nav.navigate(Routes.author(author.id)) }.padding(vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Avatar(author.avatar, 40.dp)
                                Spacer(Modifier.width(10.dp))
                                Column {
                                    Text(author.fullName, style = MaterialTheme.typography.titleSmall)
                                    Text(
                                        "${formatDate(post.publishedAt)} · ${post.readTime} min read",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    )
                                }
                            }
                        }
                        val cover = post.coverImage?.url
                        if (!cover.isNullOrBlank()) {
                            Spacer(Modifier.height(16.dp))
                            AsyncImage(
                                model = cover,
                                contentDescription = null,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .aspectRatio(16f / 9f)
                                    .clip(MaterialTheme.shapes.medium)
                                    .background(MaterialTheme.colorScheme.surfaceVariant),
                            )
                        }
                        Spacer(Modifier.height(20.dp))
                        paragraphs(post.body.orEmpty()).forEach { paragraph ->
                            Text(paragraph, style = ArticleBody, modifier = Modifier.padding(bottom = 16.dp))
                        }
                        if (post.tags.isNotEmpty()) {
                            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                post.tags.forEach { tag ->
                                    AssistChip(onClick = { nav.navigate(Routes.tag(tag.slug)) }, label = { Text("#${tag.name}") })
                                }
                            }
                        }
                        Row(Modifier.padding(vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                            IconButton(onClick = {
                                if (me == null) {
                                    requireLogin()
                                } else {
                                    scope.launch { vm.toggleLike().onFailure { toast(it.message ?: "Could not update the like") } }
                                }
                            }) {
                                Icon(
                                    if (vm.liked) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                                    contentDescription = if (vm.liked) "Unlike" else "Like",
                                    tint = if (vm.liked) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                            }
                            Text("${vm.likeCount}", style = MaterialTheme.typography.labelLarge)
                            Spacer(Modifier.width(16.dp))
                            Icon(Icons.Outlined.ChatBubbleOutline, null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text(" ${vm.commentTotal}", style = MaterialTheme.typography.labelLarge)
                        }
                        HorizontalDivider()
                        Text(
                            "Comments",
                            style = MaterialTheme.typography.titleLarge,
                            modifier = Modifier.padding(top = 16.dp, bottom = 8.dp),
                        )
                        if (me == null) {
                            TextButton(onClick = { nav.navigate(Routes.LOGIN) }) { Text("Log in to join the conversation") }
                        } else {
                            OutlinedTextField(
                                value = commentText,
                                onValueChange = { commentText = it.take(COMMENT_MAX) },
                                placeholder = { Text("Add a comment") },
                                modifier = Modifier.fillMaxWidth(),
                                maxLines = 6,
                                supportingText = if (commentText.length > COMMENT_MAX - 100) {
                                    { Text("${commentText.length}/$COMMENT_MAX") }
                                } else null,
                                trailingIcon = {
                                    IconButton(
                                        enabled = commentText.isNotBlank() && !sending,
                                        onClick = {
                                            scope.launch {
                                                sending = true
                                                vm.addComment(commentText)
                                                    .onSuccess { commentText = "" }
                                                    .onFailure { toast(it.message ?: "Could not add the comment") }
                                                sending = false
                                            }
                                        },
                                    ) { Icon(Icons.AutoMirrored.Filled.Send, contentDescription = "Post comment") }
                                },
                            )
                        }
                    }
                }
                items(vm.comments, key = { it.id }) { comment ->
                    CommentRow(
                        comment = comment,
                        canDelete = me != null && (comment.author?.id == me.id || me.isAdmin),
                        canReport = me == null || comment.author?.id != me.id,
                        onAuthor = { comment.author?.let { nav.navigate(Routes.author(it.id)) } },
                        onDelete = {
                            scope.launch { vm.deleteComment(comment).onSuccess(toast).onFailure { toast(it.message ?: "Could not delete") } }
                        },
                        onReport = { if (me == null) requireLogin() else reportTarget = ReportTarget("comment", comment.id) },
                    )
                }
                item(key = "comments-footer") {
                    when {
                        vm.commentsLoading -> CenteredLoading()
                        vm.commentsError != null -> MessageBox(vm.commentsError!!, actionLabel = "Try again", onAction = vm::loadMoreComments)
                        vm.moreComments -> Box(Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) {
                            OutlinedButton(onClick = vm::loadMoreComments) { Text("Show more comments") }
                        }
                        vm.comments.isEmpty() -> MessageBox("No comments yet.")
                    }
                    Spacer(Modifier.height(24.dp))
                }
            }
        }
    }

    reportTarget?.let { target ->
        ReportDialog(
            what = if (target.type == "post") "story" else "comment",
            onDismiss = { reportTarget = null },
            onSubmit = { reason, details ->
                scope.launch {
                    vm.report(target.type, target.id, reason, details)
                        .onSuccess {
                            reportTarget = null
                            toast(it)
                        }
                        .onFailure { toast(it.message ?: "Could not send the report") }
                }
            },
        )
    }

    if (confirmDelete) {
        AlertDialog(
            onDismissRequest = { confirmDelete = false },
            title = { Text("Delete this story?") },
            text = { Text("Its likes and comments go too. This cannot be undone.") },
            confirmButton = {
                TextButton(onClick = {
                    confirmDelete = false
                    scope.launch {
                        vm.deletePost()
                            .onSuccess {
                                toast(it)
                                nav.popBackStack()
                            }
                            .onFailure { toast(it.message ?: "Could not delete the story") }
                    }
                }) { Text("Delete", color = MaterialTheme.colorScheme.error) }
            },
            dismissButton = { TextButton(onClick = { confirmDelete = false }) { Text("Cancel") } },
        )
    }
}

private val paragraphBreak = Regex("\\n\\s*\\n")

fun paragraphs(body: String): List<String> = body.split(paragraphBreak).map { it.trim() }.filter { it.isNotEmpty() }

@Composable
private fun CommentRow(
    comment: Comment,
    canDelete: Boolean,
    canReport: Boolean,
    onAuthor: () -> Unit,
    onDelete: () -> Unit,
    onReport: () -> Unit,
) {
    var menu by remember { mutableStateOf(false) }
    var confirm by remember { mutableStateOf(false) }
    Row(Modifier.fillMaxWidth().padding(start = 20.dp, end = 4.dp, top = 10.dp, bottom = 10.dp)) {
        Avatar(comment.author?.avatar, 32.dp, Modifier.clickable(onClick = onAuthor))
        Spacer(Modifier.width(10.dp))
        Column(Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(comment.author?.fullName ?: "Deleted user", style = MaterialTheme.typography.labelLarge)
                Text(
                    "  ${formatDate(comment.createdAt)}",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Text(comment.body, style = MaterialTheme.typography.bodyMedium)
        }
        if (canDelete || canReport) {
            Box {
                IconButton(onClick = { menu = true }, modifier = Modifier.size(36.dp)) {
                    Icon(Icons.Default.MoreVert, contentDescription = "Comment options", modifier = Modifier.size(18.dp))
                }
                DropdownMenu(expanded = menu, onDismissRequest = { menu = false }) {
                    if (canReport) DropdownMenuItem(text = { Text("Report") }, onClick = { menu = false; onReport() })
                    if (canDelete) DropdownMenuItem(text = { Text("Delete") }, onClick = { menu = false; confirm = true })
                }
            }
        }
    }
    if (confirm) {
        AlertDialog(
            onDismissRequest = { confirm = false },
            title = { Text("Delete this comment?") },
            confirmButton = { TextButton(onClick = { confirm = false; onDelete() }) { Text("Delete") } },
            dismissButton = { TextButton(onClick = { confirm = false }) { Text("Cancel") } },
        )
    }
}

@Composable
private fun ReportDialog(what: String, onDismiss: () -> Unit, onSubmit: (reason: String, details: String) -> Unit) {
    var reason by rememberSaveable { mutableStateOf<String?>(null) }
    var details by rememberSaveable { mutableStateOf("") }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Report this $what") },
        text = {
            Column(Modifier.verticalScroll(rememberScrollState())) {
                REPORT_REASONS.forEach { (key, label) ->
                    Row(
                        Modifier
                            .fillMaxWidth()
                            .selectable(selected = reason == key, onClick = { reason = key }, role = Role.RadioButton)
                            .padding(vertical = 2.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        RadioButton(selected = reason == key, onClick = null)
                        Spacer(Modifier.width(8.dp))
                        Text(label)
                    }
                }
                OutlinedTextField(
                    value = details,
                    onValueChange = { details = it.take(REPORT_DETAILS_MAX) },
                    label = { Text("Details (optional)") },
                    minLines = 2,
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                )
            }
        },
        confirmButton = {
            TextButton(enabled = reason != null, onClick = { reason?.let { onSubmit(it, details) } }) { Text("Send report") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } },
    )
}
