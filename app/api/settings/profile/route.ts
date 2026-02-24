import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const metadata = user.user_metadata || {};

    const profileData = {
      email: user.email,
      username: metadata.username || '',
      displayName: metadata.displayName || '',
      bio: metadata.bio || '',
      website: metadata.website || '',
      location: metadata.location || '',
      primaryGenre: metadata.primaryGenre || 'other',
      avatarUrl: metadata.avatar_url || ''
    };

    return NextResponse.json(profileData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { username, displayName, bio, website, location, primaryGenre } = body;

    if (bio && bio.length > 500) {
      return NextResponse.json(
        { error: 'Bio exceeds 500 characters' },
        { status: 400 }
      );
    }

    // Checking if username is taken would require a DB query if we enforced unique usernames across all users.
    // Since we're moving to Supabase Auth metadata without a public.profiles table right now, 
    // we will just save it to metadata. If unique usernames are strict, a public.profiles table is required.

    const { data: updatedUser, error: updateError } = await supabase.auth.updateUser({
      data: {
        username,
        displayName,
        bio,
        website,
        location,
        primaryGenre
      }
    });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const metadata = updatedUser.user?.user_metadata || {};

    const profileData = {
      email: updatedUser.user?.email,
      username: metadata.username || '',
      displayName: metadata.displayName || '',
      bio: metadata.bio || '',
      website: metadata.website || '',
      location: metadata.location || '',
      primaryGenre: metadata.primaryGenre || 'other',
      avatarUrl: metadata.avatar_url || ''
    };

    return NextResponse.json(profileData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
