import { LitElement, html, css } from 'lit-element';
import { ArcFitMixin } from '../arc-fit-mixin.js';

class TestFit extends ArcFitMixin(LitElement) {
  static get styles() {
    return css`
    :host {
      display: block;
      background: black;
      color: white;
      padding: 8px;
    }`;
  }

  static get properties() {
    const top = super.properties || {};
    const props = {
      myProp: {type: String, attribute: 'my-prop'}
    };
    return Object.assign({}, top, props);
  }

  render() {
    return html`<slot></slot>`;
  }
}
customElements.define('test-fit', TestFit);
