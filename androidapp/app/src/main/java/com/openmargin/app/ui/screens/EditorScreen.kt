package com.openmargin.app.ui.screens

import android.net.Uri
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddPhotoAlternate
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.InputChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.SuggestionChip
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.openmargin.app.data.AiDraftInput
import com.openmargin.app.data.AiParagraphInput
import com.openmargin.app.data.AiUsage
import com.openmargin.app.data.ApiException
import com.openmargin.app.data.BODY_MAX
import com.openmargin.app.data.Category
import com.openmargin.app.data.EXCERPT_MAX
import com.openmargin.app.data.Post
import com.openmargin.app.data.PostInput
import com.openmargin.app.data.TAGS_MAX
import com.openmargin.app.data.TITLE_MAX
import com.openmargin.app.data.imagePart
import com.openmargin.app.data.request
import com.openmargin.app.data.requestData
import com.openmargin.app.ui.Routes
import com.openmargin.app.ui.components.CenteredLoading
import com.openmargin.app.ui.components.MessageBox
import com.openmargin.app.ui.components.ScreenScaffold
import com.openmargin.app.ui.components.StatusBadge
import com.openmargin.app.ui.components.rememberToast
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class EditorViewModel(initialId: String?) : ViewModel() {
    var postId by mutableStateOf(initialId)
        private set
    var loading by mutableStateOf(initialId != null)
        private set
    var loadError by mutableStateOf<String?>(null)
        private set

    var title by mutableStateOf("")
        private set
    var excerpt by mutableStateOf("")
        private set
    var body by mutableStateOf("")
        private set
    var categoryId by mutableStateOf<String?>(null)
        private set
    var tags by mutableStateOf<List<String>>(emptyList())
        private set
    var coverUrl by mutableStateOf<String?>(null)
        private set
    var status by mutableStateOf("draft")
        private set
    var slug by mutableStateOf("")
        private set
    var dirty by mutableStateOf(false)
        private set

    // What is running right now ("Saving…", "Publishing…"), or null.
    var busy by mutableStateOf<String?>(null)
        private set

    var categories by mutableStateOf<List<Category>>(emptyList())
        private set
    var tagSuggestions by mutableStateOf<List<String>>(emptyList())
        private set
    private var tagSearch: Job? = null

    val isPublished: Boolean get() = status == "published"

    init {
        viewModelScope.launch { requestData { categories() }.onSuccess { categories = it.categories } }
        if (initialId != null) load(initialId)
    }

    private fun load(id: String) {
        viewModelScope.launch {
            loading = true
            loadError = null
            requestData { myPost(id) }
                .onSuccess { show(it.post) }
                .onFailure { loadError = it.message }
            loading = false
        }
    }

    private fun show(post: Post) {
        postId = post.id
        title = post.title
        excerpt = post.excerpt
        body = post.body.orEmpty()
        categoryId = post.category?.id
        tags = post.tags.map { it.name }
        coverUrl = post.coverImage?.url
        status = post.status
        slug = post.slug
        dirty = false
    }

    fun updateTitle(value: String) { title = value.take(TITLE_MAX); dirty = true }
    fun updateExcerpt(value: String) { excerpt = value.take(EXCERPT_MAX); dirty = true }
    fun updateBody(value: String) { body = value.take(BODY_MAX); dirty = true }
    fun updateCategory(id: String?) { categoryId = id; dirty = true }

    fun addTag(name: String) {
        val clean = name.trim().removePrefix("#").trim()
        if (clean.isEmpty() || tags.size >= TAGS_MAX || tags.any { it.equals(clean, ignoreCase = true) }) return
        tags = tags + clean
        tagSuggestions = emptyList()
        dirty = true
    }

    fun removeTag(name: String) {
        tags = tags - name
        dirty = true
    }

    fun searchTags(text: String) {
        tagSearch?.cancel()
        if (text.isBlank()) {
            tagSuggestions = emptyList()
            return
        }
        tagSearch = viewModelScope.launch {
            delay(250)
            requestData { tags(text.trim()) }.onSuccess { list ->
                tagSuggestions = list.tags.map { it.name }.filterNot { name -> tags.any { it.equals(name, true) } }.take(8)
            }
        }
    }

    private suspend fun <T> running(label: String, block: suspend () -> Result<T>): Result<T> {
        busy = label
        return try { block() } finally { busy = null }
    }

    // Creates the draft the first time, then updates it.
    private suspend fun saveNow(): Result<Post> {
        if (title.isBlank()) return Result.failure(ApiException("Add a title first"))
        val input = PostInput(
            title = title.trim(),
            excerpt = excerpt.trim(),
            body = body,
            category = categoryId ?: "",
            tags = tags,
        )
        val id = postId
        val result = if (id == null) requestData { createPost(input) } else requestData { updatePost(id, input) }
        return result.map { it.post }.onSuccess { show(it) }
    }

    suspend fun save(): Result<String> = running("Saving…") {
        saveNow().map { if (it.status == "draft") "Draft saved" else "Post updated" }
    }

    suspend fun publish(): Result<String> = running("Publishing…") {
        val saved = if (dirty || postId == null) saveNow() else Result.success(Unit)
        saved.mapCatching {
            val reply = request { publishPost(postId!!) }.getOrThrow()
            reply.data?.post?.let { show(it) }
            reply.message ?: "Post published"
        }
    }

    suspend fun unpublish(): Result<String> = running("Unpublishing…") {
        val id = postId ?: return@running Result.failure(ApiException("Save the draft first"))
        request { unpublishPost(id) }.map { reply ->
            reply.data?.post?.let { show(it) }
            reply.message ?: "Post moved back to drafts"
        }
    }

    suspend fun setCover(uri: Uri): Result<String> = running("Uploading cover…") {
        // A cover belongs to a saved post.
        val saved = if (postId == null) saveNow() else Result.success(Unit)
        saved.mapCatching {
            val part = imagePart("cover", uri)
            val reply = request { setCover(postId!!, part) }.getOrThrow()
            // Keep unsaved edits; only take the new cover.
            coverUrl = reply.data?.post?.coverImage?.url
            reply.message ?: "Cover image saved"
        }
    }

    suspend fun delete(): Result<String> = running("Deleting…") {
        val id = postId ?: return@running Result.success("Draft discarded")
        request { deletePost(id) }.map { it.message ?: "Post deleted" }
    }

    // ---- AI assistant ----

    var aiUsage by mutableStateOf<AiUsage?>(null)
        private set
    var aiBusy by mutableStateOf<String?>(null)
        private set
    var aiError by mutableStateOf<String?>(null)
        private set
    var aiTitles by mutableStateOf<List<String>>(emptyList())
        private set
    var aiSummary by mutableStateOf<String?>(null)
        private set
    var aiTags by mutableStateOf<List<String>>(emptyList())
        private set
    var aiImproved by mutableStateOf<Pair<String, String>?>(null)
        private set

    fun loadAiUsage() {
        viewModelScope.launch { requestData { aiUsage() }.onSuccess { aiUsage = it } }
    }

    private fun ai(kind: String, block: suspend () -> Result<AiUsage?>) {
        if (aiBusy != null) return
        viewModelScope.launch {
            aiBusy = kind
            aiError = null
            block().onSuccess { usage -> if (usage != null) aiUsage = usage }.onFailure { aiError = it.message }
            aiBusy = null
        }
    }

    private fun draftInput() = AiDraftInput(draft = body, title = title, existingTags = tags)

    fun suggestTitles() = ai("titles") {
        requestData { aiTitles(draftInput()) }.map { aiTitles = it.titles; it.usage }
    }

    fun writeSummary() = ai("summary") {
        requestData { aiSummary(draftInput()) }.map { aiSummary = it.summary; it.usage }
    }

    fun suggestTags() = ai("tags") {
        requestData { aiTags(draftInput()) }.map { aiTags = it.tags; it.usage }
    }

    fun improve(paragraph: String) = ai("improve") {
        requestData { aiImprove(AiParagraphInput(paragraph)) }.map { aiImproved = paragraph to it.improved; it.usage }
    }

    fun useImproved() {
        val (original, improved) = aiImproved ?: return
        val at = body.indexOf(original)
        if (at >= 0) updateBody(body.substring(0, at) + improved + body.substring(at + original.length))
        aiImproved = null
    }

    fun dismissImproved() {
        aiImproved = null
    }

    fun clearSummary() {
        aiSummary = null
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun EditorScreen(postId: String?, nav: NavController) {
    val vm: EditorViewModel = viewModel(key = "editor-${postId ?: "new"}") { EditorViewModel(postId) }
    val scope = rememberCoroutineScope()
    val toast = rememberToast()
    var menu by remember { mutableStateOf(false) }
    var categoryMenu by remember { mutableStateOf(false) }
    var confirmLeave by remember { mutableStateOf(false) }
    var confirmDelete by remember { mutableStateOf(false) }
    var showAi by rememberSaveable { mutableStateOf(false) }
    var tagInput by rememberSaveable { mutableStateOf("") }
    val coverPicker = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
        if (uri != null) scope.launch { vm.setCover(uri).onSuccess(toast).onFailure { toast(it.message ?: "Upload failed") } }
    }
    val pickCover = { coverPicker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) }

    fun perform(action: suspend () -> Result<String>) {
        scope.launch { action().onSuccess(toast).onFailure { toast(it.message ?: "Something went wrong") } }
    }

    BackHandler(enabled = vm.dirty) { confirmLeave = true }

    ScreenScaffold(
        title = { Text(if (vm.postId == null) "New story" else "Edit story") },
        onBack = { if (vm.dirty) confirmLeave = true else nav.popBackStack() },
        actions = {
            IconButton(onClick = { showAi = true }) { Icon(Icons.Default.AutoAwesome, contentDescription = "AI assistant") }
            TextButton(onClick = { perform(vm::save) }, enabled = vm.busy == null && vm.title.isNotBlank()) { Text("Save") }
            Box {
                IconButton(onClick = { menu = true }) { Icon(Icons.Default.MoreVert, contentDescription = "More") }
                DropdownMenu(expanded = menu, onDismissRequest = { menu = false }) {
                    if (vm.isPublished) {
                        DropdownMenuItem(text = { Text("View story") }, onClick = { menu = false; nav.navigate(Routes.post(vm.slug)) })
                        DropdownMenuItem(text = { Text("Move back to drafts") }, onClick = { menu = false; perform(vm::unpublish) })
                    }
                    DropdownMenuItem(text = { Text("Delete") }, onClick = { menu = false; confirmDelete = true })
                }
            }
        },
    ) { modifier ->
        when {
            vm.loading -> CenteredLoading(modifier)
            vm.loadError != null -> MessageBox(vm.loadError!!, modifier)
            else -> Column(
                modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    StatusBadge(if (vm.isPublished) "Published" else "Draft", highlighted = vm.isPublished)
                    Text(
                        vm.busy ?: if (vm.dirty) "Unsaved changes" else if (vm.postId != null) "All changes saved" else "",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }

                Box(
                    Modifier
                        .fillMaxWidth()
                        .aspectRatio(16f / 9f)
                        .clip(MaterialTheme.shapes.medium)
                        .background(MaterialTheme.colorScheme.surfaceVariant)
                        .border(1.dp, MaterialTheme.colorScheme.outline, MaterialTheme.shapes.medium)
                        .clickable(enabled = vm.busy == null, onClick = pickCover),
                    contentAlignment = Alignment.Center,
                ) {
                    if (!vm.coverUrl.isNullOrBlank()) {
                        AsyncImage(vm.coverUrl, "Cover image", contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
                    } else {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.AddPhotoAlternate, null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text("Add a cover image", color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                    if (vm.busy == "Uploading cover…") CircularProgressIndicator()
                }

                OutlinedTextField(
                    value = vm.title, onValueChange = vm::updateTitle, label = { Text("Title") },
                    textStyle = MaterialTheme.typography.titleLarge, modifier = Modifier.fillMaxWidth(),
                )
                OutlinedTextField(
                    value = vm.excerpt, onValueChange = vm::updateExcerpt, label = { Text("Summary") }, minLines = 2,
                    supportingText = { Text("${vm.excerpt.length}/$EXCERPT_MAX") }, modifier = Modifier.fillMaxWidth(),
                )

                Box {
                    OutlinedButton(onClick = { categoryMenu = true }, modifier = Modifier.fillMaxWidth()) {
                        Text(
                            vm.categories.firstOrNull { it.id == vm.categoryId }?.name ?: "Choose a category",
                            modifier = Modifier.weight(1f),
                        )
                        Icon(Icons.Default.ArrowDropDown, null)
                    }
                    DropdownMenu(expanded = categoryMenu, onDismissRequest = { categoryMenu = false }) {
                        DropdownMenuItem(text = { Text("No category") }, onClick = { categoryMenu = false; vm.updateCategory(null) })
                        vm.categories.forEach { category ->
                            DropdownMenuItem(text = { Text(category.name) }, onClick = { categoryMenu = false; vm.updateCategory(category.id) })
                        }
                    }
                }

                Column {
                    if (vm.tags.isNotEmpty()) {
                        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            vm.tags.forEach { tag ->
                                InputChip(
                                    selected = false,
                                    onClick = { vm.removeTag(tag) },
                                    label = { Text("#$tag") },
                                    trailingIcon = { Icon(Icons.Default.Close, "Remove $tag", Modifier.size(16.dp)) },
                                )
                            }
                        }
                    }
                    if (vm.tags.size < TAGS_MAX) {
                        OutlinedTextField(
                            value = tagInput,
                            onValueChange = {
                                tagInput = it
                                vm.searchTags(it)
                            },
                            label = { Text("Add a tag (${vm.tags.size}/$TAGS_MAX)") },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                            keyboardActions = KeyboardActions(onDone = {
                                vm.addTag(tagInput)
                                tagInput = ""
                            }),
                            modifier = Modifier.fillMaxWidth(),
                        )
                        if (vm.tagSuggestions.isNotEmpty()) {
                            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                vm.tagSuggestions.forEach { name ->
                                    SuggestionChip(onClick = {
                                        vm.addTag(name)
                                        tagInput = ""
                                    }, label = { Text(name) })
                                }
                            }
                        }
                    }
                }

                OutlinedTextField(
                    value = vm.body,
                    onValueChange = vm::updateBody,
                    label = { Text("Tell your story") },
                    placeholder = { Text("Leave a blank line between paragraphs") },
                    minLines = 12,
                    modifier = Modifier.fillMaxWidth(),
                )

                if (vm.isPublished) {
                    Button(onClick = { perform(vm::save) }, enabled = vm.busy == null && vm.dirty, modifier = Modifier.fillMaxWidth()) {
                        Text("Update story")
                    }
                } else {
                    Button(onClick = { perform(vm::publish) }, enabled = vm.busy == null && vm.title.isNotBlank(), modifier = Modifier.fillMaxWidth()) {
                        Text("Publish")
                    }
                }
                Spacer(Modifier.height(16.dp))
            }
        }
    }

    if (showAi) {
        AiAssistantSheet(vm, onDismiss = { showAi = false }, toast = toast)
    }

    if (confirmLeave) {
        AlertDialog(
            onDismissRequest = { confirmLeave = false },
            title = { Text("Leave without saving?") },
            text = { Text("Your latest changes are not saved.") },
            confirmButton = {
                TextButton(onClick = {
                    confirmLeave = false
                    nav.popBackStack()
                }) { Text("Discard") }
            },
            dismissButton = {
                TextButton(onClick = {
                    confirmLeave = false
                    scope.launch {
                        vm.save().onSuccess { nav.popBackStack() }.onFailure { toast(it.message ?: "Could not save") }
                    }
                }) { Text("Save") }
            },
        )
    }

    if (confirmDelete) {
        AlertDialog(
            onDismissRequest = { confirmDelete = false },
            title = { Text("Delete this story?") },
            text = { Text("This cannot be undone.") },
            confirmButton = {
                TextButton(onClick = {
                    confirmDelete = false
                    scope.launch {
                        vm.delete()
                            .onSuccess {
                                toast(it)
                                nav.popBackStack()
                            }
                            .onFailure { toast(it.message ?: "Could not delete") }
                    }
                }) { Text("Delete", color = MaterialTheme.colorScheme.error) }
            },
            dismissButton = { TextButton(onClick = { confirmDelete = false }) { Text("Cancel") } },
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
private fun AiAssistantSheet(vm: EditorViewModel, onDismiss: () -> Unit, toast: (String) -> Unit) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    LaunchedEffect(Unit) { vm.loadAiUsage() }

    ModalBottomSheet(onDismissRequest = onDismiss, sheetState = sheetState) {
        Column(
            Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp)
                .padding(bottom = 32.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text("Writing assistant", style = MaterialTheme.typography.titleLarge)
            vm.aiUsage?.let {
                Text(
                    "${it.remaining} of ${it.limit} requests left today",
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            if (vm.body.isBlank()) {
                Text("Write some of your story first. The assistant reads your draft.", color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            vm.aiError?.let { Text(it, color = MaterialTheme.colorScheme.error) }

            AiSection("Suggest titles", busy = vm.aiBusy == "titles", enabled = vm.aiBusy == null && vm.body.isNotBlank(), onRun = vm::suggestTitles) {
                vm.aiTitles.forEach { suggestion ->
                    Surface(
                        onClick = {
                            vm.updateTitle(suggestion)
                            toast("Title updated")
                        },
                        shape = MaterialTheme.shapes.small,
                        color = MaterialTheme.colorScheme.surfaceContainer,
                        modifier = Modifier.fillMaxWidth(),
                    ) { Text(suggestion, Modifier.padding(12.dp)) }
                }
            }

            AiSection("Write a summary", busy = vm.aiBusy == "summary", enabled = vm.aiBusy == null && vm.body.isNotBlank(), onRun = vm::writeSummary) {
                vm.aiSummary?.let { summary ->
                    Text(summary, style = MaterialTheme.typography.bodyMedium)
                    TextButton(onClick = {
                        vm.updateExcerpt(summary)
                        vm.clearSummary()
                        toast("Summary updated")
                    }) { Text("Use as summary") }
                }
            }

            AiSection("Suggest tags", busy = vm.aiBusy == "tags", enabled = vm.aiBusy == null && vm.body.isNotBlank(), onRun = vm::suggestTags) {
                if (vm.aiTags.isNotEmpty()) {
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        vm.aiTags.forEach { tag ->
                            val added = vm.tags.any { it.equals(tag, ignoreCase = true) }
                            AssistChip(onClick = { vm.addTag(tag) }, enabled = !added && vm.tags.size < TAGS_MAX, label = { Text("#$tag") })
                        }
                    }
                }
            }

            HorizontalDivider()
            Text("Improve a paragraph", style = MaterialTheme.typography.titleMedium)
            val improved = vm.aiImproved
            if (improved != null) {
                Surface(shape = MaterialTheme.shapes.small, color = MaterialTheme.colorScheme.primaryContainer) {
                    Text(improved.second, Modifier.padding(12.dp))
                }
                Row {
                    TextButton(onClick = {
                        vm.useImproved()
                        toast("Paragraph replaced")
                    }) { Text("Replace paragraph") }
                    TextButton(onClick = vm::dismissImproved) { Text("Keep mine") }
                }
            } else if (vm.aiBusy == "improve") {
                CenteredLoading()
            } else {
                Text("Tap a paragraph to rewrite it.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                paragraphs(vm.body).forEach { paragraph ->
                    Surface(
                        onClick = { vm.improve(paragraph) },
                        enabled = vm.aiBusy == null,
                        shape = MaterialTheme.shapes.small,
                        color = MaterialTheme.colorScheme.surfaceContainer,
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text(paragraph, Modifier.padding(12.dp), maxLines = 3, overflow = TextOverflow.Ellipsis)
                    }
                }
            }
        }
    }
}

@Composable
private fun AiSection(
    title: String,
    busy: Boolean,
    enabled: Boolean,
    onRun: () -> Unit,
    results: @Composable () -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(title, style = MaterialTheme.typography.titleMedium, modifier = Modifier.weight(1f))
            if (busy) {
                CircularProgressIndicator(Modifier.size(20.dp), strokeWidth = 2.dp)
                Spacer(Modifier.width(12.dp))
            } else {
                OutlinedButton(onClick = onRun, enabled = enabled) { Text("Ask") }
            }
        }
        results()
    }
}
