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
        versionCode = 4
        versionName = "1.0.3"
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

    buildFeatures {
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    testImplementation("junit:junit:4.13.2")
}
