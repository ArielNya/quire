package app.quire.desk;

import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onPause() {
        super.onPause();
        WebView web = getBridge() != null ? getBridge().getWebView() : null;
        if (web != null) {
            web.onPause();
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        WebView web = getBridge() != null ? getBridge().getWebView() : null;
        if (web != null) {
            web.onResume();
        }
    }

    @Override
    public void onDestroy() {
        WebView web = getBridge() != null ? getBridge().getWebView() : null;
        if (web != null) {
            web.stopLoading();
            web.loadUrl("about:blank");
        }
        super.onDestroy();
    }
}
