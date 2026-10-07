package com.nkonenterprises.rentalverifyai;

import static org.junit.Assert.assertEquals;
import org.junit.Test;

public final class BackNavigationTest {
    @Test
    public void navigatesHistoryBeforeUsingFallback() {
        for (String path : new String[] {"/", "/login", "/pricing", "/dashboard", null}) {
            assertEquals(BackNavigation.Action.HISTORY, BackNavigation.action(true, path));
        }
    }

    @Test
    public void returnsToHomeFromPublicAndSignedInEntryPages() {
        for (String path : new String[] {"/analyze", "/login", "/pricing", "/dashboard",
                "/checkout/success", "/results/example"}) {
            assertEquals(BackNavigation.Action.HOME, BackNavigation.action(false, path));
        }
    }

    @Test
    public void exitsFromHomeOrBeforeAUrlHasLoaded() {
        for (String path : new String[] {"/", "", null}) {
            assertEquals(BackNavigation.Action.EXIT, BackNavigation.action(false, path));
        }
    }
}
