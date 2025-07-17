# Views Helpers

This directory contains reusable helper functions and components for the views layer.

## Structure

### `planFeatures.js`
Contains utility functions for handling plan features and their limitations:

- `FEATURE_LIMITATION_TYPES`: Constants for different types of limitations
- `FEATURE_CONFIG`: Configuration mapping for each feature type
- `getFeatureLimitationText()`: Generates limitation text for a feature
- `hasFeatureLimitations()`: Checks if a feature has limitations
- `getEnabledFeatures()`: Gets all enabled features from a plan
- `isFeatureEnabled()`: Checks if a specific feature is enabled

### `PlanFeaturesList.js`
A reusable React component that displays plan features with their limitations in a consistent format. Includes tooltips and modal functionality for detailed feature information.

### `FeatureDetailModal.js`
A modal component that displays detailed information about a specific feature, including benefits, limitations, and usage examples.

### `index.js`
Central export file that provides organized access to all helpers and constants.

## Usage

```javascript
import { 
    PlanFeaturesList, 
    getFeatureLimitationText, 
    PLAN_DISPLAY_TEXTS 
} from '../helpers'

// Use the component
<PlanFeaturesList features={plan.features} />

// Use utility functions
const limitationText = getFeatureLimitationText('createProducts', feature)
```

## Best Practices

1. **Text Constants**: Define constants for user-facing text strings
2. **Single Responsibility**: Each helper function should have one clear purpose
3. **Reusability**: Design helpers to be reusable across different components
4. **Type Safety**: Use clear parameter names and return types
5. **Documentation**: Keep this README updated with new helpers

## Adding New Features

When adding new plan features:

1. Update `FEATURE_CONFIG` in `planFeatures.js`
2. Add corresponding constants to `FEATURE_LIMITATION_TYPES`
3. Test the `getFeatureLimitationText` function
4. Update this documentation 