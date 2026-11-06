package com.openmargin.app

import android.app.Application
import com.openmargin.app.data.AppGraph

class OpenMarginApp : Application() {
    override fun onCreate() {
        super.onCreate()
        AppGraph.init(this)
    }
}
