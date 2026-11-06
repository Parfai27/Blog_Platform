package com.openmargin.app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Checkbox
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
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
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.openmargin.app.data.AdminUser
import com.openmargin.app.data.AppGraph
import com.openmargin.app.data.Category
import com.openmargin.app.data.CategoryInput
import com.openmargin.app.data.Report
import com.openmargin.app.data.ReportCounts
import com.openmargin.app.data.ResolveInput
import com.openmargin.app.data.request
import com.openmargin.app.data.requestData
import com.openmargin.app.ui.components.CenteredLoading
import com.openmargin.app.ui.components.MessageBox
import com.openmargin.app.ui.components.ScreenScaffold
import com.openmargin.app.ui.components.StatusBadge
import com.openmargin.app.ui.components.formatDate
import com.openmargin.app.ui.components.rememberToast
import kotlinx.coroutines.launch

class AdminViewModel : ViewModel() {
    // ---- Reports ----
    var reportStatus by mutableStateOf("open")
        private set
    var reports by mutableStateOf<List<Report>>(emptyList())
        private set
    var reportCounts by mutableStateOf(ReportCounts())
        private set
    var reportsLoading by mutableStateOf(false)
        private set
    var reportsError by mutableStateOf<String?>(null)
        private set
    private var reportPage = 0
    private var reportPages = 1
    val moreReports: Boolean get() = reportPage < reportPages

    // ---- Users ----
    var userStatus by mutableStateOf<String?>(null)
        private set
    var userSearch by mutableStateOf("")
        private set
    var users by mutableStateOf<List<AdminUser>>(emptyList())
        private set
    var usersLoading by mutableStateOf(false)
        private set
    var usersError by mutableStateOf<String?>(null)
        private set
    var userTotal by mutableIntStateOf(0)
        private set
    private var userPage = 0
    private var userPages = 1
    val moreUsers: Boolean get() = userPage < userPages

    // ---- Categories ----
    var categories by mutableStateOf<List<Category>>(emptyList())
        private set
    var categoriesLoading by mutableStateOf(false)
        private set
    var categoriesError by mutableStateOf<String?>(null)
        private set

    init {
        loadReports(reset = true)
        loadUsers(reset = true)
        loadCategories()
    }

    fun setReportFilter(status: String) {
        reportStatus = status
        loadReports(reset = true)
    }

    fun loadReports(reset: Boolean) {
        viewModelScope.launch {
            reportsLoading = true
            reportsError = null
            requestData { adminReports(reportStatus, if (reset) 1 else reportPage + 1) }
                .onSuccess {
                    reports = if (reset) it.reports else reports + it.reports
                    reportCounts = it.counts
                    reportPage = it.pagination.page
                    reportPages = it.pagination.pages
                }
                .onFailure { reportsError = it.message }
            reportsLoading = false
        }
    }

    suspend fun resolve(report: Report, removeContent: Boolean, blockUser: Boolean): Result<String> =
        request { resolveReport(report.id, ResolveInput(removeContent, blockUser)) }.map { reply ->
            // Removing content can close other reports too, so reload the list.
            loadReports(reset = true)
            if (blockUser) loadUsers(reset = true)
            reply.message ?: "Report resolved"
        }

    fun setUserFilter(status: String?) {
        userStatus = status
        loadUsers(reset = true)
    }

    fun searchUsers(text: String) {
        userSearch = text.trim()
        loadUsers(reset = true)
    }

    fun loadUsers(reset: Boolean) {
        viewModelScope.launch {
            usersLoading = true
            usersError = null
            requestData { adminUsers(userStatus, userSearch.ifBlank { null }, if (reset) 1 else userPage + 1) }
                .onSuccess {
                    users = if (reset) it.users else users + it.users
                    userPage = it.pagination.page
                    userPages = it.pagination.pages
                    userTotal = it.pagination.total
                }
                .onFailure { usersError = it.message }
            usersLoading = false
        }
    }

    suspend fun setBlocked(user: AdminUser, blocked: Boolean): Result<String> =
        request { if (blocked) blockUser(user.id) else unblockUser(user.id) }.map { reply ->
            users = users.map { if (it.id == user.id) it.copy(isBlocked = blocked) else it }
            reply.message ?: if (blocked) "User blocked" else "User unblocked"
        }

    fun loadCategories() {
        viewModelScope.launch {
            categoriesLoading = true
            categoriesError = null
            requestData { categories() }
                .onSuccess { categories = it.categories }
                .onFailure { categoriesError = it.message }
            categoriesLoading = false
        }
    }

    suspend fun saveCategory(existing: Category?, name: String, description: String): Result<String> {
        val input = CategoryInput(name.trim(), description.trim())
        val result = if (existing == null) request { createCategory(input) } else request { updateCategory(existing.id, input) }
        return result.map {
            loadCategories()
            it.message ?: "Category saved"
        }
    }

    suspend fun deleteCategory(category: Category): Result<String> =
        request { deleteCategory(category.id) }.map {
            categories = categories.filterNot { it.id == category.id }
            it.message ?: "Category deleted"
        }
}

private val ADMIN_TABS = listOf("Reports", "Users", "Categories")

@Composable
fun AdminScreen(nav: NavController) {
    val session by AppGraph.session.state.collectAsStateWithLifecycle()
    var tab by rememberSaveable { mutableIntStateOf(0) }
    var editingCategory by remember { mutableStateOf<Category?>(null) }
    var creatingCategory by remember { mutableStateOf(false) }

    if (session?.user?.isAdmin != true) {
        ScreenScaffold(title = { Text("Admin") }, onBack = { nav.popBackStack() }) { modifier ->
            MessageBox("Only an admin can open this page.", modifier)
        }
        return
    }

    val vm: AdminViewModel = viewModel { AdminViewModel() }

    ScreenScaffold(
        title = { Text("Admin") },
        onBack = { nav.popBackStack() },
        floatingActionButton = {
            if (tab == 2) {
                FloatingActionButton(onClick = { creatingCategory = true }) { Icon(Icons.Default.Add, contentDescription = "New category") }
            }
        },
    ) { modifier ->
        Column(modifier.fillMaxSize()) {
            TabRow(selectedTabIndex = tab) {
                ADMIN_TABS.forEachIndexed { index, label ->
                    Tab(selected = tab == index, onClick = { tab = index }, text = { Text(label) })
                }
            }
            when (tab) {
                0 -> ReportsTab(vm)
                1 -> UsersTab(vm)
                else -> CategoriesTab(vm, onEdit = { editingCategory = it })
            }
        }
    }

    if (creatingCategory || editingCategory != null) {
        CategoryDialog(
            vm = vm,
            existing = editingCategory,
            onDismiss = {
                creatingCategory = false
                editingCategory = null
            },
        )
    }
}

@Composable
private fun FilterRow(options: List<Pair<String?, String>>, selected: String?, onSelect: (String?) -> Unit) {
    LazyRow(
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        items(options) { (key, label) ->
            FilterChip(selected = selected == key, onClick = { onSelect(key) }, label = { Text(label) })
        }
    }
}

@Composable
private fun ReportsTab(vm: AdminViewModel) {
    val scope = rememberCoroutineScope()
    val toast = rememberToast()
    var resolving by remember { mutableStateOf<Report?>(null) }
    val counts = vm.reportCounts

    LazyColumn(Modifier.fillMaxSize()) {
        item {
            FilterRow(
                listOf("open" to "Open (${counts.open})", "resolved" to "Resolved (${counts.resolved})", "all" to "All (${counts.all})"),
                vm.reportStatus,
            ) { vm.setReportFilter(it ?: "open") }
        }
        items(vm.reports, key = { it.id }) { report ->
            ReportCard(report, onResolve = { resolving = report })
        }
        item {
            when {
                vm.reportsLoading -> CenteredLoading()
                vm.reportsError != null -> MessageBox(vm.reportsError!!, actionLabel = "Try again", onAction = { vm.loadReports(reset = true) })
                vm.reports.isEmpty() -> MessageBox(if (vm.reportStatus == "open") "No open reports. All clear." else "No reports.")
                vm.moreReports -> Box(Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) {
                    OutlinedButton(onClick = { vm.loadReports(reset = false) }) { Text("Load more") }
                }
            }
        }
    }

    resolving?.let { report ->
        var removeContent by remember(report.id) { mutableStateOf(false) }
        var blockUser by remember(report.id) { mutableStateOf(false) }
        AlertDialog(
            onDismissRequest = { resolving = null },
            title = { Text("Resolve report") },
            text = {
                Column {
                    Text("Choose what to do. Leave both unticked to close it with no action.")
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Checkbox(checked = removeContent, onCheckedChange = { removeContent = it })
                        Text("Remove the ${report.targetType}")
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Checkbox(checked = blockUser, onCheckedChange = { blockUser = it })
                        Text("Block ${report.targetAuthor?.name ?: "the author"}")
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = {
                    resolving = null
                    scope.launch {
                        vm.resolve(report, removeContent, blockUser).onSuccess(toast).onFailure { toast(it.message ?: "Could not resolve") }
                    }
                }) { Text("Resolve") }
            },
            dismissButton = { TextButton(onClick = { resolving = null }) { Text("Cancel") } },
        )
    }
}

@Composable
private fun ReportCard(report: Report, onResolve: () -> Unit) {
    ElevatedCard(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 6.dp)) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                StatusBadge(report.reasonLabel.ifBlank { report.reason }, highlighted = report.status == "open")
                Text(
                    "${report.targetType} · ${formatDate(report.createdAt)}",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Text("“${report.preview}”", style = MaterialTheme.typography.bodyLarge)
            if (report.targetType == "comment") {
                Text("On: ${report.postTitle}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            if (report.details.isNotBlank()) Text("Details: ${report.details}", style = MaterialTheme.typography.bodyMedium)
            Text(
                "Reported by ${report.reporter?.name ?: "a deleted user"} · Author: ${report.targetAuthor?.name ?: "deleted"}" +
                    if (report.targetAuthor?.isBlocked == true) " (blocked)" else "",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            if (report.status == "open") {
                OutlinedButton(onClick = onResolve) { Text("Resolve") }
            } else {
                val actions = report.actions.joinToString(", ") {
                    when (it) {
                        "content_removed" -> "content removed"
                        "user_blocked" -> "author blocked"
                        else -> it
                    }
                }.ifBlank { "no action" }
                Text(
                    "Resolved by ${report.resolvedBy?.name ?: "an admin"} on ${formatDate(report.resolvedAt)}: $actions",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary,
                )
            }
        }
    }
}

@Composable
private fun UsersTab(vm: AdminViewModel) {
    val scope = rememberCoroutineScope()
    val toast = rememberToast()
    var query by rememberSaveable { mutableStateOf(vm.userSearch) }

    LazyColumn(Modifier.fillMaxSize()) {
        item {
            OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                placeholder = { Text("Search name or email") },
                leadingIcon = { Icon(Icons.Default.Search, null) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                keyboardActions = KeyboardActions(onSearch = { vm.searchUsers(query) }),
                modifier = Modifier.fillMaxWidth().padding(start = 16.dp, end = 16.dp, top = 12.dp),
            )
            FilterRow(listOf(null to "All", "active" to "Active", "blocked" to "Blocked"), vm.userStatus, vm::setUserFilter)
        }
        items(vm.users, key = { it.id }) { user ->
            Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 10.dp), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text(user.fullName, style = MaterialTheme.typography.titleSmall)
                        if (user.role == "admin") StatusBadge("Admin", highlighted = true)
                        if (user.isBlocked) StatusBadge("Blocked")
                    }
                    Text(user.email, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(
                        "${user.postCount} published · joined ${formatDate(user.joinedAt)}",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                if (user.role != "admin") {
                    TextButton(onClick = {
                        scope.launch { vm.setBlocked(user, !user.isBlocked).onSuccess(toast).onFailure { toast(it.message ?: "Failed") } }
                    }) {
                        Text(
                            if (user.isBlocked) "Unblock" else "Block",
                            color = if (user.isBlocked) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error,
                        )
                    }
                }
            }
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
        }
        item {
            when {
                vm.usersLoading -> CenteredLoading()
                vm.usersError != null -> MessageBox(vm.usersError!!, actionLabel = "Try again", onAction = { vm.loadUsers(reset = true) })
                vm.users.isEmpty() -> MessageBox("No users match.")
                vm.moreUsers -> Box(Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) {
                    OutlinedButton(onClick = { vm.loadUsers(reset = false) }) { Text("Load more") }
                }
            }
        }
    }
}

@Composable
private fun CategoriesTab(vm: AdminViewModel, onEdit: (Category) -> Unit) {
    val scope = rememberCoroutineScope()
    val toast = rememberToast()
    var deleting by remember { mutableStateOf<Category?>(null) }

    LazyColumn(Modifier.fillMaxSize()) {
        items(vm.categories, key = { it.id }) { category ->
            Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 10.dp), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(category.name, style = MaterialTheme.typography.titleSmall)
                    if (category.description.isNotBlank()) {
                        Text(category.description, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    Text(
                        "${category.postCount ?: 0} published · /${category.slug}",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                TextButton(onClick = { onEdit(category) }) { Text("Edit") }
                TextButton(onClick = { deleting = category }) { Text("Delete", color = MaterialTheme.colorScheme.error) }
            }
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
        }
        item {
            when {
                vm.categoriesLoading -> CenteredLoading()
                vm.categoriesError != null -> MessageBox(vm.categoriesError!!, actionLabel = "Try again", onAction = vm::loadCategories)
                vm.categories.isEmpty() -> MessageBox("No categories yet. Tap + to add one.")
            }
        }
    }

    deleting?.let { category ->
        AlertDialog(
            onDismissRequest = { deleting = null },
            title = { Text("Delete ${category.name}?") },
            text = { Text("A category that posts still use cannot be deleted.") },
            confirmButton = {
                TextButton(onClick = {
                    deleting = null
                    scope.launch { vm.deleteCategory(category).onSuccess(toast).onFailure { toast(it.message ?: "Could not delete") } }
                }) { Text("Delete", color = MaterialTheme.colorScheme.error) }
            },
            dismissButton = { TextButton(onClick = { deleting = null }) { Text("Cancel") } },
        )
    }
}

@Composable
private fun CategoryDialog(vm: AdminViewModel, existing: Category?, onDismiss: () -> Unit) {
    var name by rememberSaveable { mutableStateOf(existing?.name.orEmpty()) }
    var description by rememberSaveable { mutableStateOf(existing?.description.orEmpty()) }
    var error by remember { mutableStateOf<String?>(null) }
    var saving by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val toast = rememberToast()

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (existing == null) "New category" else "Edit category") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(name, { name = it.take(40) }, label = { Text("Name") }, singleLine = true)
                OutlinedTextField(
                    description, { description = it.take(200) }, label = { Text("Description") }, minLines = 2,
                    supportingText = { Text("${description.length}/200") },
                )
                if (error != null) Text(error!!, color = MaterialTheme.colorScheme.error)
            }
        },
        confirmButton = {
            TextButton(enabled = name.isNotBlank() && !saving, onClick = {
                scope.launch {
                    saving = true
                    vm.saveCategory(existing, name, description)
                        .onSuccess {
                            toast(it)
                            onDismiss()
                        }
                        .onFailure { error = it.message }
                    saving = false
                }
            }) { Text("Save") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } },
    )
}
