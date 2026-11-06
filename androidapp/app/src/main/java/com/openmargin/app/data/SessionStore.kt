package com.openmargin.app.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking

data class Session(val token: String, val user: User)

private val Context.sessionStore by preferencesDataStore(name = "session")

private val TOKEN = stringPreferencesKey("token")
private val USER = stringPreferencesKey("user")

// Keeps the JWT and the logged-in user across app restarts.
class SessionStore(private val context: Context) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val _state = MutableStateFlow<Session?>(null)
    val state: StateFlow<Session?> = _state.asStateFlow()

    val token: String? get() = _state.value?.token
    val user: User? get() = _state.value?.user

    init {
        // A small read at startup, so the first screen already knows who is logged in.
        runBlocking {
            val prefs = context.sessionStore.data.first()
            val token = prefs[TOKEN]
            val user = prefs[USER]?.let {
                runCatching { ApiClient.json.decodeFromString(User.serializer(), it) }.getOrNull()
            }
            if (token != null && user != null) _state.value = Session(token, user)
        }
    }

    fun save(token: String, user: User) {
        _state.value = Session(token, user)
        persist()
    }

    fun updateUser(user: User) {
        val current = _state.value ?: return
        _state.value = current.copy(user = user)
        persist()
    }

    fun clear() {
        _state.value = null
        persist()
    }

    private fun persist() {
        val session = _state.value
        scope.launch {
            context.sessionStore.edit { prefs ->
                if (session == null) {
                    prefs.remove(TOKEN)
                    prefs.remove(USER)
                } else {
                    prefs[TOKEN] = session.token
                    prefs[USER] = ApiClient.json.encodeToString(User.serializer(), session.user)
                }
            }
        }
    }
}
