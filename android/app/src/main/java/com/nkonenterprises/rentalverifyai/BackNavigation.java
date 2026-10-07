package com.nkonenterprises.rentalverifyai;

final class BackNavigation {
    enum Action { HISTORY, HOME, EXIT }

    private BackNavigation() {}

    static Action action(boolean canGoBack, String path) {
        if (canGoBack) {
            return Action.HISTORY;
        }
        if (path != null && !path.isEmpty() && !"/".equals(path)) {
            return Action.HOME;
        }
        return Action.EXIT;
    }
}
