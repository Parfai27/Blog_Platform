package com.openmargin.app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Sort
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.openmargin.app.data.Category
import com.openmargin.app.data.requestData
import com.openmargin.app.ui.Routes
import com.openmargin.app.ui.components.PostPager
import com.openmargin.app.ui.components.ScreenScaffold
import com.openmargin.app.ui.components.postItems
import kotlinx.coroutines.launch

class FeedViewModel(private val tag: String?) : ViewModel() {
    var categories by mutableStateOf<List<Category>>(emptyList())
        private set
    var category by mutableStateOf<String?>(null)
        private set
    var search by mutableStateOf("")
        private set
    var oldestFirst by mutableStateOf(false)
        private set

    val pager = PostPager(viewModelScope) { page ->
        requestData {
            posts(
                search = search.ifBlank { null },
                category = category,
                tag = tag,
                sort = if (oldestFirst) "oldest" else null,
                page = page,
            )
        }
    }

    init {
        if (tag == null) {
            viewModelScope.launch { requestData { categories() }.onSuccess { categories = it.categories } }
        }
        pager.refresh()
    }

    fun selectCategory(slug: String?) {
        category = slug
        pager.refresh()
    }

    fun applySearch(text: String) {
        if (text.trim() == search) return
        search = text.trim()
        pager.refresh()
    }

    fun setOrder(oldest: Boolean) {
        oldestFirst = oldest
        pager.refresh()
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeedScreen(tag: String?, nav: NavController) {
    val vm: FeedViewModel = viewModel(key = "feed-${tag.orEmpty()}") { FeedViewModel(tag) }
    var searchOpen by rememberSaveable { mutableStateOf(vm.search.isNotEmpty()) }
    var query by rememberSaveable { mutableStateOf(vm.search) }
    var sortMenu by remember { mutableStateOf(false) }
    var refreshing by remember { mutableStateOf(false) }
    val listState = rememberLazyListState()

    LaunchedEffect(vm.pager.loading) { if (!vm.pager.loading) refreshing = false }

    ScreenScaffold(
        title = {
            if (tag == null) {
                Text("Open Margin", fontFamily = FontFamily.Serif, fontWeight = FontWeight.SemiBold)
            } else {
                Text("#$tag")
            }
        },
        onBack = if (tag != null) ({ nav.popBackStack() }) else null,
        actions = {
            IconButton(onClick = {
                searchOpen = !searchOpen
                if (!searchOpen) {
                    query = ""
                    vm.applySearch("")
                }
            }) {
                Icon(if (searchOpen) Icons.Default.Close else Icons.Default.Search, contentDescription = "Search")
            }
            IconButton(onClick = { sortMenu = true }) {
                Icon(Icons.AutoMirrored.Filled.Sort, contentDescription = "Sort")
            }
            DropdownMenu(expanded = sortMenu, onDismissRequest = { sortMenu = false }) {
                DropdownMenuItem(text = { Text("Newest first") }, onClick = { sortMenu = false; vm.setOrder(false) })
                DropdownMenuItem(text = { Text("Oldest first") }, onClick = { sortMenu = false; vm.setOrder(true) })
            }
        },
    ) { modifier ->
        PullToRefreshBox(
            isRefreshing = refreshing,
            onRefresh = {
                refreshing = true
                vm.pager.refresh()
            },
            modifier = modifier.fillMaxSize(),
        ) {
            LazyColumn(Modifier.fillMaxSize(), state = listState) {
                if (searchOpen) {
                    item(key = "search") {
                        OutlinedTextField(
                            value = query,
                            onValueChange = { query = it },
                            placeholder = { Text("Search stories") },
                            singleLine = true,
                            leadingIcon = { Icon(Icons.Default.Search, null) },
                            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                            keyboardActions = KeyboardActions(onSearch = { vm.applySearch(query) }),
                            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
                        )
                    }
                }
                if (vm.categories.isNotEmpty()) {
                    item(key = "categories") {
                        LazyRow(
                            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                        ) {
                            item {
                                FilterChip(selected = vm.category == null, onClick = { vm.selectCategory(null) }, label = { Text("All") })
                            }
                            items(vm.categories, key = { it.id }) { category ->
                                FilterChip(
                                    selected = vm.category == category.slug,
                                    onClick = { vm.selectCategory(category.slug) },
                                    label = { Text(category.name) },
                                )
                            }
                        }
                    }
                }
                if (vm.search.isNotEmpty() && vm.pager.loadedOnce) {
                    item(key = "results") {
                        Text(
                            "${vm.pager.total} result${if (vm.pager.total == 1) "" else "s"} for \"${vm.search}\"",
                            style = MaterialTheme.typography.labelLarge,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                        )
                    }
                }
                postItems(vm.pager, emptyText = "No stories here yet.") { nav.navigate(Routes.post(it.slug)) }
            }
        }
    }
}
