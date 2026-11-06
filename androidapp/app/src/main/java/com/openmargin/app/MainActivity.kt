package com.openmargin.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.openmargin.app.ui.AppNavigation
import com.openmargin.app.ui.theme.OpenMarginTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            OpenMarginTheme {
                AppNavigation()
            }
        }
    }
}
