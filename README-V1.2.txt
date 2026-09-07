GreenHub v1.2 account/profile test

Replace/add these files into the matching paths in AGROLOGIC-SITE.

Test flow:
1. Open login.html with Live Server.
2. Choose Create new account.
3. Create a test account using a throwaway password.
4. You should arrive at greenhub/index.html.
5. Open My Plants.
6. Add your first real plant photo and details.
7. Add sale price and optionally enable exchange offers.
8. Tick Ready for marketplace and save.
9. Add the second plant.
10. Refresh: plants should remain.
11. Logout and sign in again: account and plants should remain in this browser.

Prototype limitation: this uses localStorage only. It does NOT create a secure real account on a server and does NOT publish the plant into the public marketplace yet.
