import type { PageLayoutConfig } from './PageLayout.types';

// The theme's page layouts: the scaffold writes the run's theme over these.
export const layouts: Record<'app' | 'marketing', PageLayoutConfig> = {
  "app": {
    "docksFirst": "sidebars",
    "header": {
      "needed": false,
      "start": "",
      "center": "",
      "end": "",
      "separation": "none",
      "overlay": false,
      "sticky": false
    },
    "sidebar": {
      "needed": true,
      "side": "left",
      "top": "logo, Create button",
      "items": "navigation, dashboard list",
      "bottom": "account",
      "widthPx": 264,
      "separation": "divider"
    },
    "footer": {
      "needed": false,
      "start": "",
      "center": "",
      "end": "",
      "padding": "4",
      "gap": "4",
      "separation": "none"
    },
    "main": {
      "container": "fluid",
      "maxWidthPx": 0,
      "padding": "6",
      "align": "start",
      "separation": "none"
    },
    "logo": "sidebar",
    "account": "sidebar"
  },
  "marketing": {
    "docksFirst": "header",
    "header": {
      "needed": true,
      "start": "logo",
      "center": "navigation",
      "end": "account",
      "separation": "none",
      "overlay": true,
      "sticky": true
    },
    "sidebar": {
      "needed": false,
      "side": "left",
      "top": "",
      "items": "",
      "bottom": "",
      "widthPx": 0,
      "separation": "none"
    },
    "footer": {
      "needed": true,
      "content": "Site links in columns, then a line of small print",
      "padding": "6",
      "gap": "4",
      "separation": "divider"
    },
    "main": {
      "container": "fixed",
      "maxWidthPx": 1120,
      "padding": "9",
      "align": "center",
      "separation": "none"
    },
    "logo": "header",
    "account": "header"
  }
};
