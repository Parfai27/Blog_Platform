package com.openmargin.app.ui

import android.net.Uri
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.openmargin.app.data.AppGraph
import com.openmargin.app.ui.components.LocalSnackbar
import com.openmargin.app.ui.screens.AdminScreen
import com.openmargin.app.ui.screens.AuthorScreen
import com.openmargin.app.ui.screens.EditProfileScreen
import com.openmargin.app.ui.screens.EditorScreen
import com.openmargin.app.ui.screens.FeedScreen
import com.openmargin.app.ui.screens.ForgotPasswordScreen
import com.openmargin.app.ui.screens.LoginScreen
import com.openmargin.app.ui.screens.PostScreen
import com.openmargin.app.ui.screens.ProfileScreen
import com.openmargin.app.ui.screens.ResetPasswordScreen
import com.openmargin.app.ui.screens.SignupScreen

object Routes {
    const val HOME = "home"
    const val TAG = "tag/{slug}"
    const val POST = "post/{slug}"
    const val AUTHOR = "author/{id}"
    const val LOGIN = "login"
    const val SIGNUP = "signup"
    const val FORGOT = "forgot"
    const val RESET = "reset?email={email}&code={code}"
    const val PROFILE = "profile"
    const val EDIT_PROFILE = "profile/edit"
    const val EDITOR = "editor?id={id}"
    const val ADMIN = "admin"

    fun tag(slug: String) = "tag/${Uri.encode(slug)}"
    fun post(slug: String) = "post/${Uri.encode(slug)}"
    fun author(id: String) = "author/$id"
    fun reset(email: String, code: String?) = "reset?email=${Uri.encode(email)}&code=${Uri.encode(code ?: "")}"
    fun editor(id: String? = null) = if (id == null) "editor" else "editor?id=$id"
}

private val tabRoutes = setOf(Routes.HOME, Routes.PROFILE, Routes.TAG)

@Composable
fun AppNavigation() {
    val nav = rememberNavController()
    val snackbar = remember { SnackbarHostState() }
    val session by AppGraph.session.state.collectAsStateWithLifecycle()
    val backStack by nav.currentBackStackEntryAsState()
    val route = backStack?.destination?.route

    CompositionLocalProvider(LocalSnackbar provides snackbar) {
        Scaffold(
            snackbarHost = { SnackbarHost(snackbar) },
            bottomBar = {
                if (route in tabRoutes) {
                    NavigationBar {
                        NavigationBarItem(
                            selected = route == Routes.HOME || route == Routes.TAG,
                            onClick = { nav.switchTab(Routes.HOME) },
                            icon = { Icon(Icons.Default.Home, null) },
                            label = { Text("Home") },
                        )
                        NavigationBarItem(
                            selected = false,
                            onClick = { nav.navigate(if (session == null) Routes.LOGIN else Routes.editor()) },
                            icon = { Icon(Icons.Default.Edit, null) },
                            label = { Text("Write") },
                        )
                        NavigationBarItem(
                            selected = route == Routes.PROFILE,
                            onClick = { nav.switchTab(Routes.PROFILE) },
                            icon = { Icon(Icons.Default.Person, null) },
                            label = { Text("Profile") },
                        )
                    }
                }
            },
        ) { padding ->
            // Only the bottom: each screen draws its own top bar under the status bar.
            // Without the bottom bar this is the keyboard or gesture-bar height.
            NavHost(
                navController = nav,
                startDestination = Routes.HOME,
                modifier = Modifier.padding(bottom = padding.calculateBottomPadding()),
            ) {
                composable(Routes.HOME) {
                    FeedScreen(tag = null, nav = nav)
                }
                composable(Routes.TAG, arguments = listOf(navArgument("slug") { type = NavType.StringType })) {
                    FeedScreen(tag = it.arguments?.getString("slug"), nav = nav)
                }
                composable(Routes.POST, arguments = listOf(navArgument("slug") { type = NavType.StringType })) {
                    PostScreen(slug = it.arguments?.getString("slug").orEmpty(), nav = nav)
                }
                composable(Routes.AUTHOR, arguments = listOf(navArgument("id") { type = NavType.StringType })) {
                    AuthorScreen(authorId = it.arguments?.getString("id").orEmpty(), nav = nav)
                }
                composable(Routes.LOGIN) { LoginScreen(nav) }
                composable(Routes.SIGNUP) { SignupScreen(nav) }
                composable(Routes.FORGOT) { ForgotPasswordScreen(nav) }
                composable(
                    Routes.RESET,
                    arguments = listOf(
                        navArgument("email") { type = NavType.StringType; defaultValue = "" },
                        navArgument("code") { type = NavType.StringType; defaultValue = "" },
                    ),
                ) {
                    ResetPasswordScreen(
                        nav = nav,
                        initialEmail = it.arguments?.getString("email").orEmpty(),
                        initialCode = it.arguments?.getString("code").orEmpty(),
                    )
                }
                composable(Routes.PROFILE) { ProfileScreen(nav) }
                composable(Routes.EDIT_PROFILE) { EditProfileScreen(nav) }
                composable(
                    Routes.EDITOR,
                    arguments = listOf(navArgument("id") { type = NavType.StringType; nullable = true; defaultValue = null }),
                ) {
                    EditorScreen(postId = it.arguments?.getString("id"), nav = nav)
                }
                composable(Routes.ADMIN) { AdminScreen(nav) }
            }
        }
    }
}

private fun NavHostController.switchTab(route: String) {
    navigate(route) {
        popUpTo(graph.findStartDestination().id) { saveState = true }
        launchSingleTop = true
        restoreState = true
    }
}
