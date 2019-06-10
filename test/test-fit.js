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
    return {
      myProp: {type: String, attribute: 'my-prop'}
    };
  }

  render() {
    return html`<slot></slot>`;
  }
}
customElements.define('test-fit', TestFit);
