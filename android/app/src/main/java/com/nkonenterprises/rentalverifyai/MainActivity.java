package com.nkonenterprises.rentalverifyai;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public final class MainActivity extends Activity {
    private static final String APP_HOST = "rentalverifyai.vercel.app";
    private static final String APP_URL =
            "https://rentalverifyai.vercel.app/analyze?source=android-app";
    private static final int FILE_CHOOSER_REQUEST = 1001;

    private WebView webView;
    private ValueCallback<Uri[]> pendingFileChooser;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        webView.setLayoutParams(
                new ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setUserAgentString(
                settings.getUserAgentString() + " RentalVerifyAI-Android/1.0.2");

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
        }

        CookieManager cookies = CookieManager.getInstance();
        cookies.setAcceptCookie(true);
        cookies.setAcceptThirdPartyCookies(webView, true);

        webView.setWebViewClient(
                new WebViewClient() {
                    @Override
                    public boolean shouldOverrideUrlLoading(
                            WebView view, WebResourceRequest request) {
                        return openOutsideAppIfNeeded(request.getUrl());
                    }

                    @Override
                    @SuppressWarnings("deprecation")
                    public boolean shouldOverrideUrlLoading(WebView view, String url) {
                        return openOutsideAppIfNeeded(Uri.parse(url));
                    }
                });

        webView.setWebChromeClient(
                new WebChromeClient() {
                    @Override
                    public boolean onShowFileChooser(
                            WebView view,
                            ValueCallback<Uri[]> filePathCallback,
                            FileChooserParams fileChooserParams) {
                        if (pendingFileChooser != null) {
                            pendingFileChooser.onReceiveValue(null);
                        }
                        pendingFileChooser = filePathCallback;

                        Intent chooserIntent;
                        try {
                            chooserIntent = fileChooserParams.createIntent();
                        } catch (ActivityNotFoundException exception) {
                            pendingFileChooser = null;
                            return false;
                        }

                        try {
                            startActivityForResult(chooserIntent, FILE_CHOOSER_REQUEST);
                            return true;
                        } catch (ActivityNotFoundException exception) {
                            pendingFileChooser = null;
                            return false;
                        }
                    }
                });

        webView.setDownloadListener(
                (url, userAgent, contentDisposition, mimeType, contentLength) ->
                        openExternal(Uri.parse(url)));

        if (savedInstanceState == null || webView.restoreState(savedInstanceState) == null) {
            Uri deepLink = getIntent().getData();
            webView.loadUrl(isTrustedAppUri(deepLink) ? deepLink.toString() : APP_URL);
        }
    }

    private boolean openOutsideAppIfNeeded(Uri uri) {
        if (isTrustedAppUri(uri)) {
            return false;
        }
        openExternal(uri);
        return true;
    }

    private boolean isTrustedAppUri(Uri uri) {
        return uri != null
                && "https".equalsIgnoreCase(uri.getScheme())
                && APP_HOST.equalsIgnoreCase(uri.getHost());
    }

    private void openExternal(Uri uri) {
        if (uri == null) {
            return;
        }
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (ActivityNotFoundException ignored) {
            // The app remains open if the device cannot handle an external URL.
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != FILE_CHOOSER_REQUEST || pendingFileChooser == null) {
            return;
        }

        Uri[] results = null;
        if (resultCode == RESULT_OK) {
            ClipData clipData = data == null ? null : data.getClipData();
            if (clipData != null) {
                results = new Uri[clipData.getItemCount()];
                for (int index = 0; index < clipData.getItemCount(); index++) {
                    results[index] = clipData.getItemAt(index).getUri();
                }
            } else {
                results = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
            }
        }

        pendingFileChooser.onReceiveValue(results);
        pendingFileChooser = null;
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (pendingFileChooser != null) {
            pendingFileChooser.onReceiveValue(null);
            pendingFileChooser = null;
        }
        if (webView != null) {
            webView.stopLoading();
            webView.setWebChromeClient(null);
            webView.setWebViewClient(null);
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
