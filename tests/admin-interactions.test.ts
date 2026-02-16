/**
 * Admin Interactions Test
 *
 * This file tests the admin interaction functionality for the GroqTales platform.
 * It includes tests for admin authentication, content creation, and community moderation.
 */

import {
  isAdminLoggedIn,
  performAdminAction,
  getAdminActions,
  clearAdminActions,
} from '../lib/admin-service';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Admin Authentication', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test('isAdminLoggedIn returns false when not logged in', () => {
    expect(isAdminLoggedIn()).toBe(false);
  });

  test('isAdminLoggedIn returns true when admin session is set', () => {
    localStorageMock.setItem('adminSession', 'true');
    expect(isAdminLoggedIn()).toBe(true);
  });
});

describe('Admin Actions', () => {
  beforeEach(() => {
    localStorageMock.setItem('adminSession', 'true');
    clearAdminActions();
  });

  test('admin can like a story', async () => {
    const storyId = 'test-story-123';
    const result = await performAdminAction({
      type: 'like',
      storyId,
    });

    expect(result).toBe(true);

    const actions = getAdminActions();
    expect(actions.length).toBe(1);
    expect(actions[0]!.type).toBe('like');
    expect(actions[0]!.storyId).toBe(storyId);
  });

  test('admin can comment on a story', async () => {
    const storyId = 'test-story-456';
    const content = 'This is an official admin comment';

    const result = await performAdminAction({
      type: 'comment',
      storyId,
      content,
    });

    expect(result).toBe(true);

    const actions = getAdminActions();
    expect(actions.length).toBe(1);
    expect(actions[0]!.type).toBe('comment');
    expect(actions[0]!.storyId).toBe(storyId);
    expect(actions[0]!.content).toBe(content);
  });

  test('admin can delete a story', async () => {
    const storyId = 'test-story-789';

    const result = await performAdminAction({
      type: 'delete',
      storyId,
    });

    expect(result).toBe(true);

    const actions = getAdminActions();
    expect(actions.length).toBe(1);
    expect(actions[0]!.type).toBe('delete');
    expect(actions[0]!.storyId).toBe(storyId);
  });

  test('admin can create a post', async () => {
    const content = 'Welcome to GroqTales! This is an official announcement.';

    const result = await performAdminAction({
      type: 'post',
      content,
    });

    expect(result).toBe(true);

    const actions = getAdminActions();
    expect(actions.length).toBe(1);
    expect(actions[0]!.type).toBe('post');
    expect(actions[0]!.content).toBe(content);
  });
});

describe('Admin Actions History', () => {
  beforeEach(() => {
    localStorageMock.setItem('adminSession', 'true');
    clearAdminActions();
  });

  test('getAdminActions returns actions in reverse chronological order', async () => {
    // Perform multiple actions
    await performAdminAction({ type: 'post', content: 'First post' });
    await performAdminAction({ type: 'like', storyId: 'story-1' });
    await performAdminAction({
      type: 'comment',
      storyId: 'story-2',
      content: 'Great story!',
    });

    const actions = getAdminActions();

    expect(actions.length).toBe(3);
    // Most recent action should be first
    expect(actions[0]!.type).toBe('comment');
    expect(actions[1]!.type).toBe('like');
    expect(actions[2]!.type).toBe('post');
  });

  test('clearAdminActions removes all actions', async () => {
    await performAdminAction({ type: 'post', content: 'Test post' });
    await performAdminAction({ type: 'like', storyId: 'test-story' });

    expect(getAdminActions().length).toBe(2);

    clearAdminActions();

    expect(getAdminActions().length).toBe(0);
  });
});
