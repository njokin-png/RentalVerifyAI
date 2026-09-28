plugins {
    id("com.android.application")
}

android {
    namespace = "com.nkonenterprises.rentalverifyai"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.nkonenterprises.rentalverifyai"
        minSdk = 23
        targetSdk = 36
        versionCode = 3
        versionName = "1.0.2"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
