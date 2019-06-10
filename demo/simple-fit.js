import { LitElement, html, css } from 'lit-element';
import { ArcFitMixin } from '../arc-fit-mixin.js';

class SimpleFit extends ArcFitMixin(LitElement) {
  static get styles() {
    return css`
    :host {
      background-color: blue;
      color: white;
      text-align: center;
    }`;
  }

  static get properties() {
    return {
      myProp: { type: String, attribute: 'my-prop' }
    };
  }

  render() {
    return html`<slot></slot>`;
  }
}
window.customElements.define('simple-fit', SimpleFit);
