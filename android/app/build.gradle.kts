plugins {
    id("com.android.application")
}

val releaseStoreFile = providers.gradleProperty("RENTALVERIFYAI_RELEASE_STORE_FILE").orNull
val releaseStorePassword = providers.gradleProperty("RENTALVERIFYAI_RELEASE_STORE_PASSWORD").orNull
val releaseKeyAlias = providers.gradleProperty("RENTALVERIFYAI_RELEASE_KEY_ALIAS").orNull
val releaseKeyPassword = providers.gradleProperty("RENTALVERIFYAI_RELEASE_KEY_PASSWORD").orNull
val requireReleaseSigning =
    providers.gradleProperty("RENTALVERIFYAI_REQUIRE_RELEASE_SIGNING").orNull == "true"
val hasReleaseSigning = listOf(
    releaseStoreFile,
    releaseStorePassword,
    releaseKeyAlias,
    releaseKeyPassword,
).all { !it.isNullOrBlank() }

android {
    namespace = "com.nkonenterprises.rentalverifyai"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.nkonenterprises.rentalverifyai"
        minSdk = 23
        targetSdk = 36
        versionCode = 5
        versionName = "1.0.4"
    }

    signingConfigs {
        create("release") {
            if (hasReleaseSigning) {
                storeFile = file(releaseStoreFile!!)
                storeType = "PKCS12"
                storePassword = releaseStorePassword
                keyAlias = releaseKeyAlias
                keyPassword = releaseKeyPassword
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            if (requireReleaseSigning && !hasReleaseSigning) {
                throw GradleException(
                    "Stable release signing is required. Configure all RENTALVERIFYAI_RELEASE_* properties.",
                )
            }
            if (hasReleaseSigning) {
                signingConfig = signingConfigs.getByName("release")
            }
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
