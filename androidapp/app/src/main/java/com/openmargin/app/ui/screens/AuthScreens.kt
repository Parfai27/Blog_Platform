package com.openmargin.app.ui.screens

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddAPhoto
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.openmargin.app.data.AppGraph
import com.openmargin.app.data.EmailInput
import com.openmargin.app.data.LoginInput
import com.openmargin.app.data.NAME_MAX
import com.openmargin.app.data.ResetInput
import com.openmargin.app.data.imagePart
import com.openmargin.app.data.request
import com.openmargin.app.data.requestData
import com.openmargin.app.data.textPart
import com.openmargin.app.ui.Routes
import com.openmargin.app.ui.components.ScreenScaffold
import com.openmargin.app.ui.components.rememberToast
import kotlinx.coroutines.launch

private suspend fun logIn(email: String, password: String): Result<Unit> =
    requestData { login(LoginInput(email.trim(), password)) }.map { AppGraph.session.save(it.token, it.user) }

@Composable
private fun FormColumn(modifier: Modifier, content: @Composable ColumnScope.() -> Unit) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 24.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) { content() }
}

@Composable
private fun SubmitButton(text: String, busy: Boolean, enabled: Boolean = true, onClick: () -> Unit) {
    Button(onClick = onClick, enabled = enabled && !busy, modifier = Modifier.fillMaxWidth().padding(top = 4.dp)) {
        if (busy) CircularProgressIndicator(Modifier.size(18.dp), strokeWidth = 2.dp) else Text(text)
    }
}

@Composable
private fun ErrorText(error: String?) {
    if (error != null) Text(error, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodyMedium)
}

@Composable
fun LoginScreen(nav: NavController) {
    var email by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    var busy by rememberBusy()
    var error by rememberSaveable { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    val toast = rememberToast()

    ScreenScaffold(title = { Text("Log in") }, onBack = { nav.popBackStack() }) { modifier ->
        FormColumn(modifier) {
            Text("Welcome back", style = MaterialTheme.typography.headlineMedium)
            OutlinedTextField(
                value = email, onValueChange = { email = it }, label = { Text("Email") }, singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email), modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = password, onValueChange = { password = it }, label = { Text("Password") }, singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password), modifier = Modifier.fillMaxWidth(),
            )
            ErrorText(error)
            SubmitButton("Log in", busy, enabled = email.isNotBlank() && password.isNotBlank()) {
                scope.launch {
                    busy = true
                    error = null
                    logIn(email, password)
                        .onSuccess {
                            toast("Logged in")
                            nav.popBackStack()
                        }
                        .onFailure { error = it.message }
                    busy = false
                }
            }
            TextButton(onClick = { nav.navigate(Routes.FORGOT) }) { Text("Forgot your password?") }
            TextButton(onClick = { nav.navigate(Routes.SIGNUP) { popUpTo(Routes.LOGIN) { inclusive = true } } }) {
                Text("New here? Create an account")
            }
        }
    }
}

@Composable
fun SignupScreen(nav: NavController) {
    var firstName by rememberSaveable { mutableStateOf("") }
    var lastName by rememberSaveable { mutableStateOf("") }
    var email by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    var avatar by rememberSaveable { mutableStateOf<Uri?>(null) }
    var busy by rememberBusy()
    var error by rememberSaveable { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    val toast = rememberToast()
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
        if (uri != null) avatar = uri
    }

    ScreenScaffold(title = { Text("Create an account") }, onBack = { nav.popBackStack() }) { modifier ->
        FormColumn(modifier) {
            Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                Box(
                    Modifier
                        .size(104.dp)
                        .clip(CircleShape)
                        .border(1.dp, MaterialTheme.colorScheme.outline, CircleShape)
                        .clickable { picker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) },
                    contentAlignment = Alignment.Center,
                ) {
                    if (avatar != null) {
                        AsyncImage(model = avatar, contentDescription = "Profile image", contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
                    } else {
                        Icon(Icons.Default.AddAPhoto, contentDescription = "Choose a profile image", tint = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
            Text(
                "A profile image is required",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.align(Alignment.CenterHorizontally),
            )
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = firstName, onValueChange = { firstName = it.take(NAME_MAX) }, label = { Text("First name") },
                    singleLine = true, modifier = Modifier.weight(1f),
                )
                OutlinedTextField(
                    value = lastName, onValueChange = { lastName = it.take(NAME_MAX) }, label = { Text("Last name") },
                    singleLine = true, modifier = Modifier.weight(1f),
                )
            }
            OutlinedTextField(
                value = email, onValueChange = { email = it }, label = { Text("Email") }, singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email), modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = password, onValueChange = { password = it.take(72) }, label = { Text("Password") }, singleLine = true,
                supportingText = { Text("8 to 72 characters") },
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password), modifier = Modifier.fillMaxWidth(),
            )
            ErrorText(error)
            val ready = firstName.isNotBlank() && lastName.isNotBlank() && email.isNotBlank() && password.length >= 8 && avatar != null
            SubmitButton("Create account", busy, enabled = ready) {
                val image = avatar ?: return@SubmitButton
                scope.launch {
                    busy = true
                    error = null
                    val created = runCatching { imagePart("avatar", image) }.mapCatching { part ->
                        val fields = mapOf(
                            "firstName" to textPart(firstName.trim()),
                            "lastName" to textPart(lastName.trim()),
                            "email" to textPart(email.trim()),
                            "password" to textPart(password),
                        )
                        request { signup(fields, part) }.getOrThrow()
                    }
                    created
                        .onSuccess {
                            // Sign-up returns no token, so log in with the same details.
                            logIn(email, password)
                                .onSuccess {
                                    toast("Welcome to Open Margin")
                                    nav.popBackStack()
                                }
                                .onFailure {
                                    toast("Account created. Log in to continue.")
                                    nav.navigate(Routes.LOGIN) { popUpTo(Routes.SIGNUP) { inclusive = true } }
                                }
                        }
                        .onFailure { error = it.message }
                    busy = false
                }
            }
            TextButton(onClick = { nav.navigate(Routes.LOGIN) { popUpTo(Routes.SIGNUP) { inclusive = true } } }) {
                Text("Already have an account? Log in")
            }
        }
    }
}

@Composable
fun ForgotPasswordScreen(nav: NavController) {
    var email by rememberSaveable { mutableStateOf("") }
    var busy by rememberBusy()
    var error by rememberSaveable { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    val toast = rememberToast()

    ScreenScaffold(title = { Text("Reset password") }, onBack = { nav.popBackStack() }) { modifier ->
        FormColumn(modifier) {
            Text(
                "Enter your email and we'll send you a 6-digit code.",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            OutlinedTextField(
                value = email, onValueChange = { email = it }, label = { Text("Email") }, singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email), modifier = Modifier.fillMaxWidth(),
            )
            ErrorText(error)
            SubmitButton("Send code", busy, enabled = email.isNotBlank()) {
                scope.launch {
                    busy = true
                    error = null
                    request { forgotPassword(EmailInput(email.trim())) }
                        .onSuccess { reply ->
                            toast(reply.message ?: "Check your email for the code")
                            // With ALLOW_DEV_RESET_CODE the API sends the code back, so fill it in.
                            nav.navigate(Routes.reset(email.trim(), reply.data?.resetCode))
                        }
                        .onFailure { error = it.message }
                    busy = false
                }
            }
            TextButton(onClick = { nav.navigate(Routes.reset(email.trim(), null)) }) { Text("I already have a code") }
        }
    }
}

@Composable
fun ResetPasswordScreen(nav: NavController, initialEmail: String, initialCode: String) {
    var email by rememberSaveable { mutableStateOf(initialEmail) }
    var code by rememberSaveable { mutableStateOf(initialCode) }
    var password by rememberSaveable { mutableStateOf("") }
    var busy by rememberBusy()
    var error by rememberSaveable { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    val toast = rememberToast()

    ScreenScaffold(title = { Text("Choose a new password") }, onBack = { nav.popBackStack() }) { modifier ->
        FormColumn(modifier) {
            OutlinedTextField(
                value = email, onValueChange = { email = it }, label = { Text("Email") }, singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email), modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = code, onValueChange = { code = it.filter(Char::isDigit).take(6) }, label = { Text("6-digit code") },
                singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = password, onValueChange = { password = it.take(72) }, label = { Text("New password") }, singleLine = true,
                supportingText = { Text("8 to 72 characters") },
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password), modifier = Modifier.fillMaxWidth(),
            )
            ErrorText(error)
            SubmitButton("Reset password", busy, enabled = email.isNotBlank() && code.length == 6 && password.length >= 8) {
                scope.launch {
                    busy = true
                    error = null
                    request { resetPassword(ResetInput(email.trim(), code, password)) }
                        .onSuccess {
                            toast(it.message ?: "Password reset. Log in with your new password.")
                            nav.navigate(Routes.LOGIN) { popUpTo(Routes.LOGIN) { inclusive = true } }
                        }
                        .onFailure { error = it.message }
                    busy = false
                }
            }
        }
    }
}

@Composable
private fun rememberBusy() = remember { mutableStateOf(false) }
