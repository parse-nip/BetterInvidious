# DNS Setup for invidious.popped.dev

The certificate is already issued. For **invidious.popped.dev** to work, add these records to your `popped.dev` DNS:

## Option A: CNAME (simplest)

| Type | Name      | Value                    |
|------|-----------|--------------------------|
| CNAME| invidious | betterinvidious.fly.dev  |

## Option B: A + AAAA (if CNAME doesn't work)

| Type | Name      | Value                      |
|------|-----------|----------------------------|
| A    | invidious | 66.241.125.85              |
| AAAA | invidious | 2a09:8280:1::e2:6e17:0     |

**Note:** These IPs may change if you run `fly ips release` or recreate the app. CNAME is more stable.

## Verify

After DNS propagates (can take a few minutes to 48 hours):

```powershell
fly certs check invidious.popped.dev -a betterinvidious
```

Then visit **https://invidious.popped.dev**
