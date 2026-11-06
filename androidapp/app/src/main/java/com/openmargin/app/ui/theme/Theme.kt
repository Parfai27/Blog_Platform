package com.openmargin.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

// Colors from the React app (reactapp/src): green #0f6b4c, grey-green text and borders.
val BrandGreen = Color(0xFF0F6B4C)

private val LightColors = lightColorScheme(
    primary = BrandGreen,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFD7EBE1),
    onPrimaryContainer = Color(0xFF06372A),
    secondary = Color(0xFF5D6B66),
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFE7EEEA),
    onSecondaryContainer = Color(0xFF1C1C1C),
    background = Color.White,
    onBackground = Color(0xFF161616),
    surface = Color.White,
    onSurface = Color(0xFF161616),
    surfaceVariant = Color(0xFFF2F5F3),
    onSurfaceVariant = Color(0xFF5D6B66),
    surfaceContainer = Color(0xFFF4F6F5),
    surfaceContainerHigh = Color(0xFFEEF2F0),
    outline = Color(0xFFD5DDD8),
    outlineVariant = Color(0xFFECECEC),
    error = Color(0xFFB3261E),
)

private val DarkColors = darkColorScheme(
    primary = Color(0xFF7FD1AB),
    onPrimary = Color(0xFF003825),
    primaryContainer = BrandGreen,
    onPrimaryContainer = Color(0xFFD7EBE1),
    secondary = Color(0xFFB4C2BC),
    onSecondary = Color(0xFF1F2B27),
    secondaryContainer = Color(0xFF2A3531),
    onSecondaryContainer = Color(0xFFDCE5E0),
    background = Color(0xFF111413),
    onBackground = Color(0xFFE6E9E7),
    surface = Color(0xFF111413),
    onSurface = Color(0xFFE6E9E7),
    surfaceVariant = Color(0xFF1E2321),
    onSurfaceVariant = Color(0xFFA9B5B0),
    surfaceContainer = Color(0xFF1A1E1C),
    surfaceContainerHigh = Color(0xFF232826),
    outline = Color(0xFF3D4743),
    outlineVariant = Color(0xFF2C3330),
)

// Headings use a serif like the web app's Newsreader; body text stays sans-serif.
private val base = Typography()
private val AppTypography = Typography(
    displaySmall = base.displaySmall.copy(fontFamily = FontFamily.Serif, fontWeight = FontWeight.SemiBold),
    headlineLarge = base.headlineLarge.copy(fontFamily = FontFamily.Serif, fontWeight = FontWeight.SemiBold),
    headlineMedium = base.headlineMedium.copy(fontFamily = FontFamily.Serif, fontWeight = FontWeight.SemiBold),
    headlineSmall = base.headlineSmall.copy(fontFamily = FontFamily.Serif, fontWeight = FontWeight.SemiBold),
    titleLarge = base.titleLarge.copy(fontFamily = FontFamily.Serif, fontWeight = FontWeight.SemiBold),
    titleMedium = base.titleMedium.copy(fontWeight = FontWeight.SemiBold),
)

// For reading a post body.
val ArticleBody = TextStyle(fontFamily = FontFamily.Serif, fontSize = 18.sp, lineHeight = 29.sp)

@Composable
fun OpenMarginTheme(darkTheme: Boolean = isSystemInDarkTheme(), content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        typography = AppTypography,
        content = content,
    )
}
