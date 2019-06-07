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
customElements.define('simple-fit', SimpleFit);
