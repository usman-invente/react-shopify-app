<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $needsEmailVerification = $user->email !== $validated['email'];

        $user->fill($validated);

        if ($needsEmailVerification) {
            $user->email_verified_at = null;
        }

        $user->save();

        Log::info('User profile updated', [
            'user_id' => $user->id,
            'email_changed' => $needsEmailVerification,
        ]);

        return Redirect::route('profile.edit')->with('status', 'profile-updated');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        try {
            DB::transaction(function () use ($user) {
                Auth::logout();
                $user->delete();
            });

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            Log::info('User account deleted', ['user_id' => $user->id]);

            return Redirect::to('/login');
        } catch (\Exception $e) {
            Log::error('Error deleting user account', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return Redirect::back()->with('error', 'Failed to delete account');
        }
    }
}
