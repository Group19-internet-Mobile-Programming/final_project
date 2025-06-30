import * as Font from "expo-font"
import { Platform } from "react-native"

// Helper function to safely extract error messages
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === "string") {
    return error
  }
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message)
  }
  return String(error)
}

// Define font assets statically to avoid dynamic require() calls
const fontAssets = {
  "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
  "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
}

/**
 * Loads essential fonts with error handling
 */
export async function loadFonts() {
  try {
    // Load fonts using the statically defined assets
    await Font.loadAsync(fontAssets)
    return { success: true, error: null }
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error)
    console.warn("Font loading error:", errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Checks if a font is available
 */
export function isFontLoaded(fontFamily: string): boolean {
  try {
    return Font.isLoaded(fontFamily)
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error)
    console.warn(`Error checking if font "${fontFamily}" is loaded:`, errorMessage)
    return false
  }
}

/**
 * Loads fonts with retry mechanism
 */
export async function loadFontsWithRetry(maxRetries = 3) {
  let lastError: string | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await loadFonts()

    if (result.success) {
      return { success: true, error: null, attempts: attempt }
    }

    lastError = result.error
    console.warn(`Font loading attempt ${attempt}/${maxRetries} failed:`, result.error)

    // Wait before retrying (exponential backoff)
    if (attempt < maxRetries) {
      const delay = Math.pow(2, attempt - 1) * 1000 // 1s, 2s, 4s...
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  return { success: false, error: lastError, attempts: maxRetries }
}

/**
 * Gets the status of all loaded fonts
 */
export function getFontStatus(): { [fontFamily: string]: boolean } {
  const fonts = Object.keys(fontAssets)
  const status: { [fontFamily: string]: boolean } = {}

  fonts.forEach((font) => {
    status[font] = isFontLoaded(font)
  })

  return status
}

/**
 * Validates font files exist
 * Note: In React Native, we can't dynamically check file existence at runtime
 * This function provides a static validation based on our known font assets
 */
export function validateFontFiles(): { valid: boolean; missingFonts: string[] } {
  const missingFonts: string[] = []

  try {
    // We can't dynamically check file existence, but we can check if the
    // font assets were properly imported by checking if they're defined
    Object.entries(fontAssets).forEach(([fontName, asset]) => {
      if (!asset) {
        missingFonts.push(fontName)
      }
    })
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error)
    console.warn("Error during font validation:", errorMessage)
    return { valid: false, missingFonts: Object.keys(fontAssets) }
  }

  return { valid: missingFonts.length === 0, missingFonts }
}

/**
 * Gets fallback font families for different platforms
 */
export function getFallbackFonts(): { [key: string]: string } {
  // Platform-specific fallbacks
  if (Platform.OS === "ios") {
    return {
      regular: "System",
      bold: "System-Bold",
    }
  } else if (Platform.OS === "android") {
    return {
      regular: "sans-serif",
      bold: "sans-serif-medium",
    }
  } else {
    // Web or other platforms
    return {
      regular: "Arial, sans-serif",
      bold: "Arial Bold, sans-serif",
    }
  }
}

/**
 * Comprehensive font initialization with validation and fallbacks
 */
export async function initializeFonts(): Promise<{
  success: boolean
  fontsLoaded: boolean
  validationResult: ReturnType<typeof validateFontFiles>
  loadResult: Awaited<ReturnType<typeof loadFontsWithRetry>>
  fontStatus: ReturnType<typeof getFontStatus>
}> {
  console.log("Starting font initialization...")

  // Step 1: Validate font files
  const validationResult = validateFontFiles()
  console.log("Font validation result:", validationResult)

  // Step 2: Attempt to load fonts
  const loadResult = await loadFontsWithRetry(3)
  console.log("Font loading result:", loadResult)

  // Step 3: Check final status
  const fontStatus = getFontStatus()
  console.log("Final font status:", fontStatus)

  const fontsLoaded = loadResult.success
  const success = fontsLoaded || validationResult.valid

  return {
    success,
    fontsLoaded,
    validationResult,
    loadResult,
    fontStatus,
  }
}
