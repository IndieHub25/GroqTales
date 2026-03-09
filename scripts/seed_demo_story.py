#!/usr/bin/env python3
"""
seed_demo_story.py - Seeds the blockchain origin demo story into Supabase.
Run: python3 scripts/seed_demo_story.py
"""
import os, json, urllib.request, urllib.error, urllib.parse, ssl

# Load .env.local manually
env_file = os.path.join(os.path.dirname(__file__), '..', '.env.local')
if os.path.exists(env_file):
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)  # maxsplit=1: values may contain =
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL') or os.environ.get('SUPABASE_URL')
SERVICE_KEY  = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SERVICE_KEY:
    raise SystemExit('[seed] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')

HEADERS = {
    'Content-Type': 'application/json',
    'apikey': SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}',
    'Prefer': 'return=representation',
}

# ────────────────────────────────────────────────────────────────────────────
# Story content
# ────────────────────────────────────────────────────────────────────────────
CHAPTERS = [
    {
        "index": 0,
        "title": "The Broken Ledger",
        "content": (
            "The year is 2008. A screen glows in a rented apartment somewhere in the world — "
            "the exact location does not matter, and soon you will understand why that is the whole point.\n\n"
            "Satoshi Nakamoto — a name, a pseudonym, a ghost — stares at a blinking cursor. Outside, "
            "the world is unravelling. Banks that were supposed to be fortresses are crumbling. "
            "Lehman Brothers has fallen. People are lining up outside ATMs in cities they never thought "
            'would feel unsafe. The headline on the BBC reads: "The Worst Financial Crisis in 80 Years."\n\n'
            "Satoshi does not panic. Satoshi has been waiting for this moment.\n\n"
            "For years, there has been a quiet community of thinkers, hackers, and idealists who gathered "
            "in cryptography mailing lists and cypherpunk forums. They argued about something that sounded "
            "absurd at the time: what if money did not need a bank? What if strangers could transact "
            "directly — with complete certainty, with no third party deciding who deserved trust and who did not?\n\n"
            "The fundamental problem was this: how do you prevent someone from spending the same digital coin twice? "
            "In the physical world, if you hand me a twenty-dollar bill, you no longer have it. But a digital file "
            "can be copied infinitely. Without a bank keeping score — an omnipotent referee — there seemed to be no solution.\n\n"
            "Until Satoshi had one.\n\n"
            "It would not be announced with fanfare. There would be no press conference, no PowerPoint slide. "
            "Instead, on October 31, 2008, a nine-page PDF was quietly posted to a cryptography mailing list: "
            '"Bitcoin: A Peer-to-Peer Electronic Cash System."\n\n'
            "Nine pages. For something that would eventually reshape the concept of money, property, and institutional trust, "
            "nine pages seems almost thin. But sometimes the most powerful ideas are also the most precise.\n\n"
            "Satoshi hits send. Nobody will reply for sixteen hours."
        ),
    },
    {
        "index": 1,
        "title": "The Genesis Block",
        "content": (
            "January 3, 2009. At 18:15:05 UTC, a single transaction is minted into existence — "
            "fifty brand-new bitcoin. It is called the Genesis Block, or Block 0, and it carries a message "
            "embedded in its raw data like a time capsule:\n\n"
            '"The Times 03/Jan/2009 Chancellor on brink of second bailout for banks."\n\n'
            "A newspaper headline. A timestamp. A declaration.\n\n"
            "Across the world, a handful of people start running the software. Their computers begin solving "
            "mathematical puzzles. The first successful solver gets to add the next block of transactions to the chain, "
            "and for that work, they receive newly minted bitcoin. This is called mining.\n\n"
            "Hal Finney, a legendary cryptographer, downloads the software on release day. "
            "Days later, he receives the very first Bitcoin transaction in history — ten coins sent to him by Satoshi himself, as a test.\n\n"
            'Hal writes back: "Running bitcoin." Two words. A new era.\n\n'
            "The logic of the blockchain is almost deceptively simple when you finally understand it. "
            "Every transaction is grouped into a block. Each block contains a cryptographic hash — "
            "a unique digital fingerprint — of the previous block. Changing any historical transaction would change its hash, "
            "which would break every block that came after it.\n\n"
            "It is not impossible to cheat. But it is more expensive than it is worth.\n\n"
            "This is the genius of what Satoshi built: not a system that trusts people, but a system that makes trust unnecessary. "
            "The chain itself is the guarantee. The math is the referee. "
            "In a world that had just watched trusted institutions fail spectacularly, that was a revolutionary idea."
        ),
    },
    {
        "index": 2,
        "title": "The Fever, The Skeptics, and The Believers",
        "content": (
            "By 2011, the forums are buzzing. Bitcoin is worth something now — single-digit dollars, "
            "then double-digit, then briefly above thirty.\n\n"
            "The skeptics are everywhere. Economists point out that a currency with no central bank cannot function "
            "as a stable store of value. A Nobel laureate calls it a bubble.\n\n"
            "But something is happening that the critics do not fully see: a second wave of builders is arriving.\n\n"
            "One of them is a nineteen-year-old in a Waterloo dormitory, writing feverishly. "
            "His name is Vitalik Buterin. He is proposing something so ambitious that most dismiss it outright:\n\n"
            "What if the blockchain could run code?\n\n"
            "Not just track who sent coins to whom, but execute arbitrary programs — automatically, transparently, "
            "without any human operator. Buterin calls them smart contracts, borrowing a term coined by cryptographer Nick Szabo.\n\n"
            "When the Bitcoin core developers decline his vision, Buterin builds his own blockchain. "
            "Ethereum launches in 2015.\n\n"
            "In the silence between the arguments, something is happening. People are using it. "
            "Not because they understand every line of the code. Not because they trust any individual. "
            "But because the ledger itself — the chain of blocks stretching back to a cold January afternoon in 2009 — "
            "is open to anyone to inspect, verify, and challenge.\n\n"
            "The trust is in the math. And in the end, that is what changes things. Not the currency. Not the hype. "
            "But the idea that two strangers on opposite sides of the planet, who share no language and no institution, "
            "can make an agreement that neither of them can break.\n\n"
            "A chain of trust, forged in ones and zeros. That is the birth of blockchain.\n\n"
            "And somewhere, in some apartment, a cursor is still blinking."
        ),
    },
]

STORY = {
    "title": "Chains of Trust: The Birth of Blockchain",
    "content": json.dumps(CHAPTERS),
    "genre": "Technology",
    "source": "demo",
    "author_id": "cc0f24ea-31c0-484c-a404-d77ad5d9eac0",
    "author_name": "Comicraft",
    "description": "A cinematic origin story of blockchain — the idea that changed money, trust, and institutions. Follow anonymous coders, late-night arguments, and the radical belief that strangers could trust each other without a middleman.",
    "cover_image": "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop",
    "views": 0,
    "likes": 0,
}


def supabase_request(method, path, body=None, params=None):
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    if params:
        url += '?' + urllib.parse.urlencode(params)
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, headers=HEADERS, method=method)
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
            raw = resp.read()
            return resp.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        raw = e.read()
        return e.code, json.loads(raw) if raw else None


def seed():
    print('[seed] Checking for existing demo story...')
    status, data = supabase_request('GET', 'stories', params={
        'source': 'eq.demo',
        'select': 'id,title',
        'limit': '1',
    })

    if status not in (200, 201):
        print(f'[seed] ❌ Lookup failed HTTP {status}: {data}')
        return

    if status == 200 and data:
        story_id = data[0]['id']
        print(f'[seed] Story already exists, updating... id={story_id}')
        patch = {**STORY}
        del patch['author_id']  # don't change ownership
        patch_status, patch_result = supabase_request('PATCH', 'stories', body=patch, params={
            'id': f'eq.{story_id}',
        })
        if patch_status not in (200, 204):
            print(f'[seed] ❌ Update failed HTTP {patch_status}: {patch_result}')
            return
        print(f'[seed] Updated — HTTP {patch_status}')
    else:
        print('[seed] Inserting new demo story...')
        status, result = supabase_request('POST', 'stories', body=STORY)
        if status in (200, 201) and result:
            story_id = result[0]['id'] if isinstance(result, list) else result.get('id')
            print(f'[seed] ✅ Inserted story id={story_id}')
        else:
            print(f'[seed] ❌ Insert failed HTTP {status}: {result}')
            return

    print(f'\n  Story URL : /stories/{story_id}')
    print('  Audio will be generated on first play via POST /api/v1/tts/generate')
    print('  (Requires SARVAM_API_KEY to be set in the server environment)\n')


if __name__ == '__main__':
    seed()
