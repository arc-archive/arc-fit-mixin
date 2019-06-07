import { html, render } from 'lit-html';
// import '@advanced-rest-client/arc-demo-helper/arc-demo-helper.js';
import './simple-fit.js';

class DemoPage {
  constructor() {
    this.containers = [];
    for (let i = 0; i < 30; i++) {
      this.containers[i] = (i + 1);
    }

    this._updatePositionTarget = this._updatePositionTarget.bind(this);
    this._updateAlign = this._updateAlign.bind(this);
    this._toggleNoOverlap = this._toggleNoOverlap.bind(this);
    this._toggleDynamicAlign = this._toggleDynamicAlign.bind(this);
    this._windowRefit = this._windowRefit.bind(this);

    window.addEventListener('resize', this._windowRefit);
    window.addEventListener('scroll', this._windowRefit);
  }

  get fit() {
    return document.getElementById('myFit');
  }

  _windowRefit() {
    this.fit.refit();
  }

  _updatePositionTarget(e) {
    let {target} = e;
    const myFit = this.fit;
    target = myFit.positionTarget === target ? myFit._defaultPositionTarget : target;
    myFit.positionTarget.style.backgroundColor = '';
    target.style.backgroundColor = 'orange';
    myFit.positionTarget = target;
    myFit.refit();
  }

  _updateAlign(e) {
    const {target} = e;
    if (target.hasAttribute('horizontal-align')) {
      this.fit.horizontalAlign = target.getAttribute('horizontal-align');
      const children = target.parentNode.querySelectorAll('[horizontal-align]');
      for (let i = 0; i < children.length; i++) {
        if (children[i] === target) {
          if (!children[i].classList.contains('selected')) {
            children[i].classList.add('selected');
          }
        } else {
          if (children[i].classList.contains('selected')) {
            children[i].classList.remove('selected');
          }
        }
      }
    }
    if (target.hasAttribute('vertical-align')) {
      this.fit.verticalAlign = target.getAttribute('vertical-align');
      const children = target.parentNode.querySelectorAll('[vertical-align]');
      for (let i = 0; i < children.length; i++) {
        if (children[i] === target) {
          if (!children[i].classList.contains('selected')) {
            children[i].classList.add('selected');
          }
        } else {
          if (children[i].classList.contains('selected')) {
            children[i].classList.remove('selected');
          }
        }
      }
    }
    this.fit.refit();
  }

  _toggleNoOverlap(e) {
    this.fit.noOverlap = !this.fit.noOverlap;
    const {target} = e;
    if (this.fit.noOverlap) {
      if (!target.classList.contains('selected')) {
        target.classList.add('selected');
      }
    } else {
      if (target.classList.contains('selected')) {
        target.classList.remove('selected');
      }
    }
    this.fit.refit();
  }

  _toggleDynamicAlign(e) {
    this.fit.dynamicAlign = !this.fit.dynamicAlign;
    const {target} = e;
    if (this.fit.dynamicAlign) {
      if (!target.classList.contains('selected')) {
        target.classList.add('selected');
      }
    } else {
      if (target.classList.contains('selected')) {
        target.classList.remove('selected');
      }
    }
    this.fit.refit();
  }

  render() {
    render(html`<h3>
      An element with <code>ArcFitMixin</code> can be centered in
      <code>fitInto</code> or positioned around a <code>positionTarget</code>
    </h3>

    ${this.containers.map((i) => html`<div class="target" @click="${this._updatePositionTarget}">Target #${i}</div>`)}

    <simple-fit id="myFit" vertical-offset="24" auto-fit-on-attach>
      <h2>Align</h2>
      <p>
        <button @click="${this._updateAlign}" vertical-align="top">top</button>
        <button @click="${this._updateAlign}" vertical-align="middle">middle</button>
        <button @click="${this._updateAlign}" vertical-align="bottom">bottom</button>
        <button @click="${this._updateAlign}" vertical-align="auto">auto</button>
        <button @click="${this._updateAlign}" vertical-align>null</button>
      </p>
      <p>
        <button @click="${this._updateAlign}" horizontal-align="left">left</button>
        <button @click="${this._updateAlign}" horizontal-align="center">center</button>
        <button @click="${this._updateAlign}" horizontal-align="right">right</button>
        <button @click="${this._updateAlign}" horizontal-align="auto">auto</button>
        <button @click="${this._updateAlign}" horizontal-align>null</button>
      </p>
      <button @click="${this._toggleNoOverlap}">no overlap</button>
      <button @click="${this._toggleDynamicAlign}">dynamic align</button>
    </simple-fit>
    `, document.querySelector('#demo'));
  }
}

const instance = new DemoPage();
instance.render();
window._demo = instance;
