#!/usr/bin/env node
/**
 * seed-demo-story.js
 *
 * Seeds the "Chains of Trust: The Birth of Blockchain" demo story
 * into the Supabase `stories` table.
 *
 * Run: node scripts/seed-demo-story.js
 *
 * Requires environment variables (reads from .env.local automatically):
 *   NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load env from root .env.local
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('[seed] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// Demo Story Content
// ---------------------------------------------------------------------------

const DEMO_STORY = {
    title: 'Chains of Trust: The Birth of Blockchain',
    genre: 'Technology',
    genres: ['Technology', 'Science Fiction', 'Historical Fiction'],
    description:
        'A cinematic, character-driven origin story of blockchain — the idea that ' +
        'changed money, trust, and the very nature of institutions. Follow the quiet ' +
        'obsession of anonymous coders, late-night arguments, and the radical belief ' +
        'that strangers could trust each other without a middleman.',
    status: 'published',
    tags: ['blockchain', 'technology', 'origin story', 'featured', 'demo', 'crypto', 'decentralization'],
    author_name: 'Comicraft',
    cover_image_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop',
    tts_settings: {
        defaultSpeaker: 'Shubh',
        defaultLanguage: 'en-IN',
        defaultPace: 1.0,
    },
    chapters: [
        {
            title: 'The Broken Ledger',
            index: 0,
            content: `The year is 2008. A screen glows in a rented apartment somewhere in the world — the exact location doesn't matter, and soon you will understand why that is the whole point.

Satoshi Nakamoto — a name, a pseudonym, a ghost — stares at a blinking cursor. Outside, the world is unravelling. Banks that were supposed to be fortresses are crumbling. Lehman Brothers has fallen. People are lining up outside ATMs in cities they never thought would feel unsafe. The headline on the BBC reads: "The Worst Financial Crisis in 80 Years."

Satoshi does not panic. Satoshi has been waiting for this moment.

For years, there has been a quiet community of thinkers, hackers, and idealists who gathered in cryptography mailing lists and cypherpunk forums. They argued about something that sounded absurd at the time: what if money didn't need a bank? What if strangers could transact directly — with complete certainty, with no third party deciding who deserved trust and who did not?

The idea had many ancestors: David Chaum's DigiCash in the 1980s, Adam Back's Hashcash, Wei Dai's b-money, Nick Szabo's bit gold. Each was brilliant. Each had a fatal flaw. Each could be cheated, double-spent, forged.

The fundamental problem was this: how do you prevent someone from spending the same digital coin twice? In the physical world, if you hand me a twenty-dollar bill, you no longer have it. But a digital file can be copied infinitely. Without a bank keeping score — an omnipotent referee — there seemed to be no solution.

Until Satoshi had one.

It would not be announced with fanfare. There would be no press conference, no PowerPoint slide, no venture capital pitch deck. Instead, on October 31, 2008, a nine-page PDF would be quietly posted to a cryptography mailing list under the subject line: "Bitcoin: A Peer-to-Peer Electronic Cash System."

Nine pages.

For something that would eventually reshape the concept of money, property, and institutional trust, nine pages seems almost thin. But sometimes the most powerful ideas are also the most precise.

In the apartment — wherever it is — Satoshi leans back, reading the document one final time. The logic is elegant. Not new in its individual pieces, but new in how they snap together. A chain of cryptographic signatures. A distributed ledger copied across thousands of computers. A consensus mechanism that makes fraud more costly than honesty.

Satoshi hits send.

Nobody will reply for sixteen hours.`,
        },
        {
            title: 'The Genesis Block',
            index: 1,
            content: `January 3, 2009.

At 18:15:05 UTC, a single transaction is minted into existence — fifty brand-new bitcoin, forged in the code that Satoshi has been quietly perfecting in the months since the whitepaper. It is called the Genesis Block, or Block 0, and it carries a message embedded in its raw data like a time capsule:

"The Times 03/Jan/2009 Chancellor on brink of second bailout for banks."

It is a newspaper headline. A timestamp. A declaration.

In cryptography, embedding a real-world reference in the first block serves as proof that no coins were secretly pre-mined before the public launch — there could be no hidden head start. But for those who understood its symbolism, it was something more: a critique, an argument, a quiet manifesto pressed into the stone of a new kind of ledger.

The blockchain begins here.

---

Across the world, a handful of people — most of them pseudonyms on mailing lists — start running the software. Their computers begin solving mathematical puzzles. The first successful solver gets to add the next "block" of transactions to the chain, and for that work, they receive newly minted bitcoin. This is called mining.

Hal Finney, a legendary cryptographer who had spent years working on digital cash, downloads the software on release day. He runs it on his old computer. Days later, he receives the very first Bitcoin transaction in history — ten coins sent to him by Satoshi himself, as a test.

Hal writes back: "Running bitcoin."

Two words. A new era.

Finney, who would later reveal he was dying of ALS, would call his participation in those early days one of the most meaningful experiences of his life. "When Satoshi announced the first release of the software," he would write years later, "I grabbed it right away. I think I was the first person besides Satoshi to run bitcoin."

What neither of them could know is that within two years, a programmer named Laszlo Hanyecz would pay 10,000 bitcoin for two pizzas — the first real-world commercial transaction. Those coins, at their peak, would be worth over 600 million US dollars.

The logic of the blockchain is almost deceptively simple when you finally understand it. Every transaction is grouped into a block. Each block contains a cryptographic "hash" — a unique digital fingerprint — of the previous block. Changing any historical transaction would change its hash, which would break every block that came after it, which would require redoing an unimaginable amount of computational work.

It is not impossible to cheat. But it is more expensive than it is worth.

This is the genius of what Satoshi built: not a system that trusts people, but a system that makes trust unnecessary. The chain itself is the guarantee. The math is the referee.

In a world that had just watched trusted institutions fail spectacularly, that was a revolutionary idea.`,
        },
        {
            title: 'The Fever, The Skeptics, and The Believers',
            index: 2,
            content: `By 2011, the forums are buzzing.

Bitcoin is worth something now — single-digit dollars, then double-digit, then briefly above thirty. A darknet marketplace called the Silk Road is generating controversy and traffic. Journalists are writing think pieces with titles like "Bitcoin: The Future of Money?" and "Is This Cyber-Anarchist Fantasy Actually Working?"

The skeptics are everywhere. Economists point out that a currency with no central bank, no credit mechanism, and massive volatility cannot function as a stable store of value. Bankers scoff. A Nobel laureate calls it a "bubble." An op-ed writer compares it to tulip mania.

But something is happening that the critics don't fully see yet: a second wave of builders is arriving.

They are not all libertarians or cypherpunks. Some are idealists who believe in financial inclusion — the ability to send money to a family member in another country without paying a 10% fee to a remittance company. Some are developers who see in Bitcoin's blockchain something far more interesting than currency: a general-purpose, programmable trust machine.

One of them is a nineteen-year-old in a Waterloo, Ontario dormitory, writing feverishly in a programming magazine he funds himself. His name is Vitalik Buterin, and he is proposing an extension to the blockchain concept so ambitious that most of the Bitcoin community dismisses it outright.

What if the blockchain could run code?

Not just track who sent coins to whom, but execute arbitrary programs — automatically, transparently, without any human operator controlling them? A program that releases funds when certain conditions are met. A vote that can never be tampered with. A contract that enforces itself.

Buterin calls them "smart contracts," borrowing a term coined years earlier by the cryptographer Nick Szabo. And when the Bitcoin core developers decline to implement his vision, he does something simple and audacious:

He builds his own blockchain.

Ethereum launches in 2015. Its first block carries no newspaper reference. Instead, it carries a quote:

"You can only go forward." — attributed to no one.

---

Back in the apartment — in every apartment, in every timezone, across a decade of late nights and heated arguments and failed experiments and sudden breakthroughs — the same argument rages:

Can you trust a system with no one in charge?

The cypherpunks say yes. The institutional economists say no. The regulators are trying to figure out what question to even ask.

But in the silence between the arguments, something is happening. People are using it. Not because they understand every line of the code — they don't. Not because they trust Satoshi, or Vitalik, or any individual — they can't. But because the ledger itself, the chain of blocks stretching back to a cold January afternoon in 2009, is open to anyone with an Internet connection to inspect, verify, and challenge.

The trust is in the math.

And in the end, after all the volatility and the scams and the lost passwords and the midnight epiphanies, that is what changes things. Not the currency. Not the hype. But the idea — old as philosophy, new as cryptography — that two strangers on opposite sides of the planet, who share no language and no institution and no common history, can make an agreement that neither of them can break.

A chain of trust, forged in ones and zeros.

That is the birth of blockchain.

And somewhere, in some apartment, a cursor is still blinking.`,
        },
    ],
};

// ---------------------------------------------------------------------------
// Seed function
// ---------------------------------------------------------------------------

async function seed() {
    console.log('[seed] Seeding demo story: "Chains of Trust: The Birth of Blockchain"...');

    // Check if already seeded
    const { data: existing } = await supabase
        .from('stories')
        .select('id, title')
        .eq('source', 'demo')
        .maybeSingle();

    if (existing) {
        console.log(`[seed] Demo story already exists with id=${existing.id}. Updating...`);
    }

    const storyPayload = {
        title: DEMO_STORY.title,
        genre: DEMO_STORY.genre,
        description: DEMO_STORY.description,
        status: DEMO_STORY.status,
        tags: DEMO_STORY.tags,
        author_name: DEMO_STORY.author_name,
        cover_image_url: DEMO_STORY.cover_image_url,
        chapters: DEMO_STORY.chapters,
        parameters: DEMO_STORY.tts_settings,
        source: 'demo',
        ...(existing ? {} : {}),
    };

    let storyId;

    if (existing) {
        const { error } = await supabase
            .from('stories')
            .update(storyPayload)
            .eq('id', existing.id);
        if (error) { console.error('[seed] Update error:', error.message); process.exit(1); }
        storyId = existing.id;
        console.log(`[seed] Updated story id=${storyId}`);
    } else {
        const { data: inserted, error } = await supabase
            .from('stories')
            .insert(storyPayload)
            .select('id')
            .single();
        if (error) { console.error('[seed] Insert error:', error.message); process.exit(1); }
        storyId = inserted.id;
        console.log(`[seed] Inserted story id=${storyId}`);
    }

    console.log(`\n[seed] ✅ Demo story ready!`);
    console.log(`  Story ID : ${storyId}`);
    console.log(`  Story URL: /stories/${storyId}`);
    console.log(`\n  Audio will be generated on first play via POST /api/v1/tts/generate`);
    console.log(`  (Requires SARVAM_API_KEY to be set in the environment)\n`);
}

seed().catch((err) => {
    console.error('[seed] Fatal error:', err);
    process.exit(1);
});
