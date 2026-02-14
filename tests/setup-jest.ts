import { TextDecoder, TextEncoder } from 'util';

// jsdom does not always expose encoder/decoder on Node 20 test runners.
if (!global.TextEncoder) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).TextEncoder = TextEncoder;
}
if (!global.TextDecoder) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).TextDecoder = TextDecoder;
}
