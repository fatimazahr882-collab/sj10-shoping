// This file acts as a fallback for the parallel route.
// When Next.js navigates to a URL where it doesn't have a specific
// page to show in this slot, it will render this component instead
// of crashing and showing a 404. Returning null is the safest option.

export default function Default() {
  return null;
}