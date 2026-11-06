package com.openmargin.app.ui.components

import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.items
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.openmargin.app.data.Post
import com.openmargin.app.data.PostList
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

// Page-by-page post loading for the feed, author pages, and "my posts".
class PostPager(
    private val scope: CoroutineScope,
    private val fetch: suspend (page: Int) -> Result<PostList>,
) {
    var posts by mutableStateOf<List<Post>>(emptyList())
        private set
    var loading by mutableStateOf(false)
        private set
    var error by mutableStateOf<String?>(null)
        private set
    var total by mutableIntStateOf(0)
        private set
    var loadedOnce by mutableStateOf(false)
        private set

    private var page = 0
    private var pages = 1
    private var job: Job? = null

    val canLoadMore: Boolean get() = page < pages

    fun refresh() {
        job?.cancel()
        page = 0
        pages = 1
        load(reset = true)
    }

    fun loadMore() {
        if (loading || !canLoadMore) return
        load(reset = false)
    }

    private fun load(reset: Boolean) {
        job = scope.launch {
            loading = true
            error = null
            fetch(if (reset) 1 else page + 1)
                .onSuccess { list ->
                    posts = if (reset) list.posts else posts + list.posts
                    page = list.pagination.page
                    pages = list.pagination.pages
                    total = list.pagination.total
                }
                .onFailure { error = it.message }
            loading = false
            loadedOnce = true
        }
    }
}

// The cards, a spinner while the next page loads, and empty/error messages.
fun LazyListScope.postItems(
    pager: PostPager,
    emptyText: String,
    showStatus: Boolean = false,
    onOpen: (Post) -> Unit,
) {
    items(pager.posts, key = { it.id }) { post ->
        PostCard(post, onClick = { onOpen(post) }, showStatus = showStatus)
    }
    item(key = "footer") {
        when {
            pager.error != null -> MessageBox(pager.error!!, actionLabel = "Try again", onAction = {
                if (pager.posts.isEmpty()) pager.refresh() else pager.loadMore()
            })
            pager.loading -> CenteredLoading()
            pager.loadedOnce && pager.posts.isEmpty() -> MessageBox(emptyText)
            pager.canLoadMore && pager.posts.isNotEmpty() -> {
                // The footer came into view, so fetch the next page.
                LaunchedEffect(pager.posts.size) { pager.loadMore() }
                CenteredLoading()
            }
        }
    }
}
