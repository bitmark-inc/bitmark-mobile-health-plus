import { WhatNew_S51_Component } from './new-51.component';
import { DataProcessor } from '../../../processors';
import { ReleaseNoteComponent } from './release-note.component';

let currentVersion = DataProcessor.getApplicationVersion();

let WhatNewComponent = WhatNew_S51_Component;
switch (currentVersion.split('.')[1]) {
  case '51': {
    WhatNewComponent = WhatNew_S51_Component;
    break;
  }
  default: {
    WhatNewComponent = ReleaseNoteComponent;
    break;
  }
}

export { WhatNewComponent };