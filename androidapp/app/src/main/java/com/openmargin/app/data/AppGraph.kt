package com.openmargin.app.data

import android.content.Context

// The app's shared objects. Set up once in OpenMarginApp.onCreate.
object AppGraph {
    lateinit var appContext: Context
        private set
    lateinit var session: SessionStore
        private set
    lateinit var api: ApiService
        private set

    fun init(context: Context) {
        appContext = context.applicationContext
        session = SessionStore(appContext)
        api = ApiClient.create(session)
    }
}
