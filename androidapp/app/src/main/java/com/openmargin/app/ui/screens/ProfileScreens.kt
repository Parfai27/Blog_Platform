package com.openmargin.app.ui.screens

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.openmargin.app.data.AppGraph
import com.openmargin.app.data.AuthorProfile
import com.openmargin.app.data.BIO_MAX
import com.openmargin.app.data.NAME_MAX
import com.openmargin.app.data.imagePart
import com.openmargin.app.data.request
import com.openmargin.app.data.requestData
import com.openmargin.app.data.textPart
import com.openmargin.app.ui.Routes
import com.openmargin.app.ui.components.Avatar
import com.openmargin.app.ui.components.CenteredLoading
import com.openmargin.app.ui.components.MessageBox
import com.openmargin.app.ui.components.PostPager
import com.openmargin.app.ui.components.ScreenScaffold
import com.openmargin.app.ui.components.SignInPrompt
import com.openmargin.app.ui.components.StatusBadge
import com.openmargin.app.ui.components.formatDate
import com.openmargin.app.ui.components.postItems
import com.openmargin.app.ui.components.rememberToast
import kotlinx.coroutines.launch

private val MY_POST_TABS = listOf("draft" to "Drafts", "published" to "Published")

@Composable
fun ProfileScreen(nav: NavController) {
    val session by AppGraph.session.state.collectAsStateWithLifecycle()
    var confirmLogout by remember { mutableStateOf(false) }
    val toast = rememberToast()

    ScreenScaffold(
        title = { Text("Profile") },
        actions = {
            if (session?.user?.isAdmin == true) {
                IconButton(onClick = { nav.navigate(Routes.ADMIN) }) {
                    Icon(Icons.Default.AdminPanelSettings, contentDescription = "Admin")
                }
            }
            if (session != null) {
                IconButton(onClick = { confirmLogout = true }) {
                    Icon(Icons.AutoMirrored.Filled.Logout, contentDescription = "Log out")
                }
            }
        },
    ) { modifier ->
        val user = session?.user
        if (user == null) {
            SignInPrompt(
                "Log in to write, like, and comment",
                onLogin = { nav.navigate(Routes.LOGIN) },
                onSignup = { nav.navigate(Routes.SIGNUP) },
                modifier = modifier,
            )
            return@ScreenScaffold
        }

        // Pick up changes made elsewhere, such as a role change by an admin.
        LaunchedEffect(Unit) {
            requestData { me() }.onSuccess { AppGraph.session.updateUser(it.user) }
        }

        var tab by rememberSaveable { mutableStateOf(0) }
        val scope = rememberCoroutineScope()
        val pager = remember(tab) {
            PostPager(scope) { page -> requestData { myPosts(MY_POST_TABS[tab].first, page) } }
        }
        LaunchedEffect(pager) { pager.refresh() }

        LazyColumn(modifier.fillMaxSize()) {
            item {
                Column(
                    Modifier.fillMaxWidth().padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                ) {
                    Avatar(user.avatar?.url, 88.dp)
                    Text(user.fullName, style = MaterialTheme.typography.headlineSmall)
                    Text(user.email, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    if (user.isAdmin) StatusBadge("Admin", highlighted = true)
                    if (user.bio.isNotBlank()) {
                        Text(user.bio, style = MaterialTheme.typography.bodyMedium, textAlign = TextAlign.Center)
                    }
                    Spacer(Modifier.height(4.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedButton(onClick = { nav.navigate(Routes.EDIT_PROFILE) }) { Text("Edit profile") }
                        OutlinedButton(onClick = { nav.navigate(Routes.author(user.id)) }) { Text("Public page") }
                    }
                }
            }
            item {
                TabRow(selectedTabIndex = tab) {
                    MY_POST_TABS.forEachIndexed { index, (_, label) ->
                        Tab(selected = tab == index, onClick = { tab = index }, text = { Text(label) })
                    }
                }
            }
            postItems(
                pager,
                emptyText = if (tab == 0) "No drafts. Tap Write to start one." else "Nothing published yet.",
                showStatus = true,
            ) { post -> nav.navigate(Routes.editor(post.id)) }
        }
    }

    if (confirmLogout) {
        AlertDialog(
            onDismissRequest = { confirmLogout = false },
            title = { Text("Log out?") },
            confirmButton = {
                TextButton(onClick = {
                    confirmLogout = false
                    AppGraph.session.clear()
                    toast("Logged out")
                }) { Text("Log out") }
            },
            dismissButton = { TextButton(onClick = { confirmLogout = false }) { Text("Cancel") } },
        )
    }
}

@Composable
fun EditProfileScreen(nav: NavController) {
    val user = AppGraph.session.user
    var firstName by rememberSaveable { mutableStateOf(user?.firstName.orEmpty()) }
    var lastName by rememberSaveable { mutableStateOf(user?.lastName.orEmpty()) }
    var bio by rememberSaveable { mutableStateOf(user?.bio.orEmpty()) }
    var newAvatar by rememberSaveable { mutableStateOf<Uri?>(null) }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    val toast = rememberToast()
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
        if (uri != null) newAvatar = uri
    }

    ScreenScaffold(title = { Text("Edit profile") }, onBack = { nav.popBackStack() }) { modifier ->
        if (user == null) {
            MessageBox("Log in to edit your profile", modifier)
            return@ScreenScaffold
        }
        Column(
            modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Box(
                        Modifier
                            .size(96.dp)
                            .clip(CircleShape)
                            .clickable { picker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) },
                    ) {
                        if (newAvatar != null) {
                            AsyncImage(newAvatar, "New profile image", contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
                        } else {
                            Avatar(user.avatar?.url, 96.dp)
                        }
                    }
                    TextButton(onClick = { picker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) }) {
                        Text("Change photo")
                    }
                }
            }
            OutlinedTextField(firstName, { firstName = it.take(NAME_MAX) }, label = { Text("First name") }, singleLine = true, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(lastName, { lastName = it.take(NAME_MAX) }, label = { Text("Last name") }, singleLine = true, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(
                bio, { bio = it.take(BIO_MAX) }, label = { Text("Bio") }, minLines = 3,
                supportingText = { Text("${bio.length}/$BIO_MAX") }, modifier = Modifier.fillMaxWidth(),
            )
            if (error != null) Text(error!!, color = MaterialTheme.colorScheme.error)
            Button(
                onClick = {
                    scope.launch {
                        busy = true
                        error = null
                        runCatching { newAvatar?.let { imagePart("avatar", it) } }
                            .mapCatching { avatarPart ->
                                val fields = mapOf(
                                    "firstName" to textPart(firstName.trim()),
                                    "lastName" to textPart(lastName.trim()),
                                    "bio" to textPart(bio.trim()),
                                )
                                request { updateMe(fields, avatarPart) }.getOrThrow()
                            }
                            .onSuccess { reply ->
                                reply.data?.user?.let { AppGraph.session.updateUser(it) }
                                toast(reply.message ?: "Profile updated")
                                nav.popBackStack()
                            }
                            .onFailure { error = it.message }
                        busy = false
                    }
                },
                enabled = !busy && firstName.isNotBlank() && lastName.isNotBlank(),
                modifier = Modifier.fillMaxWidth(),
            ) {
                if (busy) CircularProgressIndicator(Modifier.size(18.dp), strokeWidth = 2.dp) else Text("Save")
            }
        }
    }
}

@Composable
fun AuthorScreen(authorId: String, nav: NavController) {
    val author by produceState<Result<AuthorProfile>?>(null, authorId) {
        value = requestData { author(authorId) }.map { it.author }
    }
    val scope = rememberCoroutineScope()
    val pager = remember(authorId) { PostPager(scope) { page -> requestData { posts(author = authorId, page = page) } } }
    LaunchedEffect(pager) { pager.refresh() }

    ScreenScaffold(title = { Text(author?.getOrNull()?.fullName ?: "Author") }, onBack = { nav.popBackStack() }) { modifier ->
        LazyColumn(modifier.fillMaxSize()) {
            item {
                val result = author
                when {
                    result == null -> CenteredLoading()
                    result.isFailure -> MessageBox(result.exceptionOrNull()?.message ?: "Could not load the author")
                    else -> {
                        val profile = result.getOrThrow()
                        Column(
                            Modifier.fillMaxWidth().padding(16.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(6.dp),
                        ) {
                            Avatar(profile.avatar, 88.dp)
                            Text(profile.fullName, style = MaterialTheme.typography.headlineSmall)
                            if (profile.bio.isNotBlank()) {
                                Text(profile.bio, style = MaterialTheme.typography.bodyMedium, textAlign = TextAlign.Center)
                            }
                            val joined = formatDate(profile.joinedAt)
                            Text(
                                listOfNotNull(
                                    "${profile.postCount} ${if (profile.postCount == 1) "story" else "stories"}",
                                    "${profile.likeCount} likes",
                                    joined.takeIf { it.isNotBlank() }?.let { "Joined $it" },
                                ).joinToString(" · "),
                                style = MaterialTheme.typography.labelLarge,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }
                }
            }
            postItems(pager, emptyText = "No published stories yet.") { nav.navigate(Routes.post(it.slug)) }
        }
    }
}
