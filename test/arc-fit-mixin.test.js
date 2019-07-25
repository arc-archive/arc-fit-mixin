import { fixture, assert, nextFrame, html } from '@open-wc/testing';

import './test-fit.js';

const s = document.createElement('style');
s.type = 'text/css';
s.innerHTML = `body {
  margin: 0;
  padding: 0;
}
.absolute {
  position: absolute;
  top: 0;
  left: 0;
}
.scrolling {
  overflow: auto;
}
.sized-x {
  width: 100px;
}
.sized-y {
  height: 100px;
}
.positioned-left {
  position: absolute;
  left: 100px;
}
.positioned-right {
  position: absolute;
  right: 100px;
}
.positioned-top {
  position: absolute;
  top: 100px;
}
.positioned-bottom {
  position: absolute;
  bottom: 100px;
}
.with-max-width {
  max-width: 500px;
}
.with-max-height {
  max-height: 500px;
}
.with-margin {
  margin: 20px;
}
.constrain {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 150px;
  height: 150px;
  border: 1px solid black;
  box-sizing: border-box;
}
.sizer {
  width: 9999px;
  height: 9999px;
}`;
document.getElementsByTagName('head')[0].appendChild(s);

const constrain = document.createElement('div');
constrain.classList.add('constrain');
document.body.appendChild(constrain);

const tpl = document.createElement('template');
tpl.innerHTML = `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit,
sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
culpa qui officia deserunt mollit anim id est laborum.</p>`;
tpl.id = 'ipsum';
document.body.appendChild(tpl);

describe('ArcFitMixin', () => {
  async function basicFixture() {
    return await fixture('<test-fit>Basic</test-fit>');
  }

  async function positionedXyFixture() {
    return await fixture(`
      <test-fit autofitonattach class="sized-x positioned-left positioned-top">
        Sized (x/y), positioned/positioned
      </test-fit>`);
  }

  async function inlinePositionedXyFixture() {
    return await fixture(`
    <test-fit autofitonattach class="sized-x sized-y" style="position:absolute;left:100px;top:100px;">
      Sized (x/y), positioned/positioned
    </test-fit>`);
  }

  async function absoluteFixture() {
    return await fixture(`
    <test-fit autofitonattach class="absolute">
      Absolutely positioned
    </test-fit>`);
  }

  async function sizedXyFixture() {
    return await fixture(`
    <test-fit autofitonattach class="sized-x sized-y">
      Sized (x/y), auto center/center
    </test-fit>`);
  }

  async function sizedXFixture() {
    return await fixture(`
    <test-fit autofitonattach class="sized-x">
      Sized (x), auto center/center
    </test-fit>`);
  }

  async function sectionedFixture() {
    return await fixture(`
    <test-fit autofitonattach class="sized-x">
      <div>
        Sized (x), auto center/center with scrolling section
      </div>
      <div class="internal"></div>
    </test-fit>`);
  }

  async function constrainTargetFixture() {
    return await fixture(`
    <div class="constrain">
      <test-fit autofitonattach class="el sized-x sized-y">
        <div>
          Auto center/center to parent element
        </div>
      </test-fit>
    </div>`);
  }

  async function offscreenContainerFixture() {
    return await fixture(`
    <div style="position: fixed; top: -1px; left: 0;">
      <test-fit autofitonattach class="el sized-x">
        <div>
          Sized (x), auto center/center, container is offscreen
        </div>
      </test-fit>
    </div>`);
  }

  async function hostPropertiesFixture() {
    return await fixture(`<test-fit my-prop="test-value"></test-fit>`);
  }

  // async function scrollableFixture() {
  //   return await fixture(`
  //   <test-fit autofitonattach class="scrolling">
  //     scrollable
  //     <div class="sizer"></div>
  //   </test-fit>`);
  // }

  function makeScrolling(el) {
    el.classList.add('scrolling');
    const template = document.getElementById('ipsum');
    for (let i = 0; i < 20; i++) {
      el.appendChild(template.content.cloneNode(true));
    }
  }

  function intersects(r1, r2) {
    return !(
      r2.left >= r1.right || r2.right <= r1.left || r2.top >= r1.bottom ||
      r2.bottom <= r1.top);
  }

  describe('Basic', () => {
    it('position() works without autoFitOnAttach', async () => {
      const element = await basicFixture();
      element.verticalAlign = 'top';
      element.horizontalAlign = 'left';
      element.position();
      const rect = element.getBoundingClientRect();
      assert.equal(rect.top, 0, 'top ok');
      assert.equal(rect.left, 0, 'left ok');
    });

    it('constrain() works without autoFitOnAttach', async () => {
      const element = await basicFixture();
      element.constrain();
      const style = getComputedStyle(element);
      assert.equal(style.maxWidth, window.innerWidth + 'px', 'maxWidth ok');
      assert.equal(style.maxHeight, window.innerHeight + 'px', 'maxHeight ok');
    });

    it('center() works without autoFitOnAttach', async () => {
      const element = await basicFixture();
      element.center();
      const rect = element.getBoundingClientRect();
      assert.closeTo(
        rect.left - (window.innerWidth - rect.right),
        0,
        5,
        'centered horizontally');
      assert.closeTo(
        rect.top - (window.innerHeight - rect.bottom),
        0,
        5,
        'centered vertically');
    });

    it('Computes _fitWidth for window', async () => {
      const element = await basicFixture();
      await nextFrame();
      const result = element._fitWidth;
      assert.equal(result, window.innerWidth);
    });

    it('Computes _fitWidth for fit element', async () => {
      const constrain = document.querySelector('.constrain');
      const element = await basicFixture();
      element.fitInto = constrain;
      await nextFrame();
      const result = element._fitWidth;
      assert.equal(result, constrain.getBoundingClientRect().width);
    });

    it('Computes _fitHeight for window', async () => {
      const element = await basicFixture();
      await nextFrame();
      const result = element._fitHeight;
      assert.equal(result, window.innerHeight);
    });

    it('Computes _fitHeight for fit element', async () => {
      const constrain = document.querySelector('.constrain');
      const element = await basicFixture();
      element.fitInto = constrain;
      await nextFrame();
      const result = element._fitHeight;
      assert.equal(result, constrain.getBoundingClientRect().height);
    });

    it('Computes _fitLeft for window', async () => {
      const element = await basicFixture();
      await nextFrame();
      const result = element._fitLeft;
      assert.equal(result, 0);
    });

    it('Computes _fitLeft for fit element', async () => {
      const constrain = document.querySelector('.constrain');
      const element = await basicFixture();
      element.fitInto = constrain;
      await nextFrame();
      const result = element._fitLeft;
      assert.equal(result, constrain.getBoundingClientRect().left);
    });

    it('Computes _fitTop for window', async () => {
      const element = await basicFixture();
      await nextFrame();
      const result = element._fitTop;
      assert.equal(result, 0);
    });

    it('Computes _fitTop for fit element', async () => {
      const constrain = document.querySelector('.constrain');
      const element = await basicFixture();
      element.fitInto = constrain;
      await nextFrame();
      const result = element._fitTop;
      assert.equal(result, constrain.getBoundingClientRect().top);
    });

    it('Computes _localeHorizontalAlign for RTL - right', async () => {
      const element = await basicFixture();
      element._isRTL = true;
      element.horizontalAlign = 'right';
      const result = element._localeHorizontalAlign;
      assert.equal(result, 'left');
    });

    it('Computes _localeHorizontalAlign for RTL - left', async () => {
      const element = await basicFixture();
      element._isRTL = true;
      element.horizontalAlign = 'left';
      const result = element._localeHorizontalAlign;
      assert.equal(result, 'right');
    });

    it('Preservs host properties', async () => {
      const element = await hostPropertiesFixture();
      assert.equal(element.myProp, 'test-value');
    });
  });

  describe('manual positioning', async () => {
    it('css positioned element is not re-positioned', async () => {
      const el = await positionedXyFixture();
      await nextFrame();
      const rect = el.getBoundingClientRect();
      assert.equal(rect.top, 100, 'top is unset');
      assert.equal(rect.left, 100, 'left is unset');
    });

    it('inline positioned element is not re-positioned', async () => {
      const el = await inlinePositionedXyFixture();
      await nextFrame();
      let rect = el.getBoundingClientRect();
      // need to measure document.body here because mocha sets a min-width on
      // html,body, and the element is positioned wrt to that by css
      // const bodyRect = document.body.getBoundingClientRect();
      assert.equal(rect.top, 100, 'top is unset');
      assert.equal(rect.left, 100, 'left is unset');
      el.refit();
      rect = el.getBoundingClientRect();
      assert.equal(rect.top, 100, 'top is unset after refit');
      assert.equal(rect.left, 100, 'left is unset after refit');
    });

    it('position property is preserved after', async () => {
      const el = await absoluteFixture();
      await nextFrame();
      assert.equal(
        getComputedStyle(el)
        .position,
        'absolute',
        'position:absolute is preserved');
    });
  });

  describe('fit to window', async () => {
    it('sized element is centered in viewport', async () => {
      const el = await sizedXyFixture();
      await nextFrame();
      const rect = el.getBoundingClientRect();
      assert.closeTo(
        rect.left - (window.innerWidth - rect.right),
        0,
        5,
        'centered horizontally');
      assert.closeTo(
        rect.top - (window.innerHeight - rect.bottom),
        0,
        5,
        'centered vertically');
    });

    it('sized element with margin is centered in viewport', async () => {
      const el = await sizedXyFixture();
      await nextFrame();
      el.classList.add('with-margin');
      el.refit();
      const rect = el.getBoundingClientRect();
      assert.closeTo(rect.left - (window.innerWidth - rect.right),
        0, 5, 'centered horizontally');
      assert.closeTo(rect.top - (window.innerHeight - rect.bottom),
        0, 5, 'centered vertically');
    });

    it('sized element with transformed parent is centered in viewport', async () => {
      const constrain = await constrainTargetFixture();
      await nextFrame();
      const el = constrain.querySelector('.el');
      const rectBefore = el.getBoundingClientRect();
      constrain.style.transform = 'translate3d(5px, 5px, 0)';
      el.center();
      const rectAfter = el.getBoundingClientRect();
      assert.equal(rectBefore.top, rectAfter.top, 'top ok');
      assert.equal(rectBefore.bottom, rectAfter.bottom, 'bottom ok');
      assert.equal(rectBefore.left, rectAfter.left, 'left ok');
      assert.equal(rectBefore.right, rectAfter.right, 'right ok');
    });

    it('scrolling element is centered in viewport', async () => {
      const el = await sizedXFixture();
      await nextFrame();
      makeScrolling(el);
      el.refit();
      const rect = el.getBoundingClientRect();
      assert.closeTo(rect.left - (window.innerWidth - rect.right),
        0, 5, 'centered horizontally');
      assert.closeTo(rect.top - (window.innerHeight - rect.bottom),
        0, 5, 'centered vertically');
    });

    it('scrolling element is constrained to viewport height', async () => {
      const el = await sizedXFixture();
      await nextFrame();
      makeScrolling(el);
      el.refit();
      const rect = el.getBoundingClientRect();
      assert.isTrue(
        rect.height <= window.innerHeight,
        'height is less than or equal to viewport height');
    });

    it('scrolling element with offscreen container is constrained to viewport height', async () => {
      const container = await offscreenContainerFixture();
      await nextFrame();
      const el = container.querySelector('.el');
      makeScrolling(el);
      el.refit();
      const rect = el.getBoundingClientRect();
      assert.isTrue(rect.height <= window.innerHeight,
        'height is less than or equal to viewport height');
    });

    it('scrolling element with max-height is centered in viewport', async () => {
      const el = await sizedXFixture();
      await nextFrame();
      el.classList.add('with-max-height');
      makeScrolling(el);
      el.refit();
      const rect = el.getBoundingClientRect();
      assert.closeTo(rect.left - (window.innerWidth - rect.right),
        0, 5, 'centered horizontally');
      assert.closeTo(rect.top - (window.innerHeight - rect.bottom),
        0, 5, 'centered vertically');
    });

    it('scrolling element with max-height respects max-height', async () => {
      const el = await sizedXFixture();
      await nextFrame();
      el.classList.add('with-max-height');
      makeScrolling(el);
      el.refit();
      const rect = el.getBoundingClientRect();
      assert.isTrue(rect.height <= 500, 'height is less than or equal to max-height');
    });

    it('css positioned, scrolling element is constrained to viewport height (top,left)', async () => {
      const el = await positionedXyFixture();
      await nextFrame();
      makeScrolling(el);
      el.refit();
      const rect = el.getBoundingClientRect();
      assert.isTrue(rect.height <= window.innerHeight - 100,
        'height is less than or equal to viewport height');
    });

    it('css positioned, scrolling element is constrained to viewport height (bottom, right)', async () => {
      const el = await sizedXFixture();
      await nextFrame();
      el.classList.add('positioned-bottom');
      el.classList.add('positioned-right');
      el.refit();
      const rect = el.getBoundingClientRect();
      assert.isTrue(rect.height <= window.innerHeight - 100,
        'height is less than or equal to viewport height');
    });

    it('sized, scrolling element with margin is centered in viewport', async () => {
      const el = await sizedXFixture();
      await nextFrame();
      el.classList.add('with-margin');
      makeScrolling(el);
      el.refit();
      const rect = el.getBoundingClientRect();
      assert.closeTo(rect.left - (window.innerWidth - rect.right),
        0, 5, 'centered horizontally');
      assert.closeTo(rect.top - (window.innerHeight - rect.bottom),
        0, 5, 'centered vertically');
    });

    it('sized, scrolling element is constrained to viewport height', async () => {
      const el = await sizedXFixture();
      await nextFrame();
      el.classList.add('with-margin');
      makeScrolling(el);
      el.refit();
      const rect = el.getBoundingClientRect();
      assert.isTrue(rect.height <= window.innerHeight - 20 * 2,
        'height is less than or equal to viewport height');
    });

    it('css positioned, scrolling element with margin is constrained to viewport height (top, left)', async () => {
      const el = await positionedXyFixture();
      await nextFrame();
      el.classList.add('with-margin');
      makeScrolling(el);
      el.refit();
      const rect = el.getBoundingClientRect();
      assert.isTrue(rect.height <= window.innerHeight - 100 - 20 * 2,
        'height is less than or equal to viewport height');
    });

    it('css positioned, scrolling element with margin is constrained to viewport height (bottom, right)', async () => {
      const el = await sizedXFixture();
      await nextFrame();
      el.classList.add('positioned-bottom');
      el.classList.add('positioned-right');
      el.classList.add('with-margin');
      el.refit();
      const rect = el.getBoundingClientRect();
      assert.isTrue(rect.height <= window.innerHeight - 100 - 20 * 2,
        'height is less than or equal to viewport height');
    });

    it('scrolling sizingTarget is constrained to viewport height', async () => {
      const el = await sectionedFixture();
      await nextFrame();
      const internal = el.querySelector('.internal');
      el.sizingTarget = internal;
      makeScrolling(internal);
      el.refit();
      const rect = el.getBoundingClientRect();
      assert.isTrue(rect.height <= window.innerHeight,
        'height is less than or equal to viewport height');
    });

    // it('scrolling sizingTarget preserves scrolling position', async () => {
    //   const el = await scrollableFixture();
    //   await nextFrame();
    //   el.scrollTop = 20;
    //   el.scrollLeft = 20;
    //   await nextFrame();
    //   el.refit();
    //   assert.equal(el.scrollTop, 20, 'scrollTop ok');
    //   assert.equal(el.scrollLeft, 20, 'scrollLeft ok');
    // });
  });

  describe('fit to element', () => {
    it('element fits in another element', async () => {
      const constrain = await constrainTargetFixture();
      await nextFrame();
      const el = constrain.querySelector('.el');
      makeScrolling(el);
      el.fitInto = constrain;
      el.refit();
      const rect = el.getBoundingClientRect();
      const crect = constrain.getBoundingClientRect();
      assert.isTrue(rect.height <= crect.height,
        'width is less than or equal to fitInto width');
      assert.isTrue(rect.height <= crect.height,
        'height is less than or equal to fitInto height');
    });

    it('element centers in another element', async () => {
      const constrain = await constrainTargetFixture();
      await nextFrame();
      const el = constrain.querySelector('.el');
      makeScrolling(el);
      el.fitInto = constrain;
      el.refit();
      const rect = el.getBoundingClientRect();
      const crect = constrain.getBoundingClientRect();
      assert.closeTo(rect.left - crect.left - (crect.right - rect.right),
        0, 5, 'centered horizontally in fitInto');
      assert.closeTo(rect.top - crect.top - (crect.bottom - rect.bottom),
        0, 5, 'centered vertically in fitInto');
    });

    it('element with max-width centers in another element', async () => {
      const constrain = document.querySelector('.constrain');
      const el = await sizedXyFixture();
      await nextFrame();
      el.classList.add('with-max-width');
      el.fitInto = constrain;
      el.refit();
      const rect = el.getBoundingClientRect();
      const crect = constrain.getBoundingClientRect();
      assert.closeTo(rect.left - crect.left - (crect.right - rect.right),
        0, 5, 'centered horizontally in fitInto');
      assert.closeTo(rect.top - crect.top - (crect.bottom - rect.bottom),
        0, 5, 'centered vertically in fitInto');
    });

    it('positioned element fits in another element', async () => {
      const constrain = document.querySelector('.constrain');
      const el = await sizedXyFixture();
      await nextFrame();
      // element's positionTarget is `body`, and fitInto is `constrain`.
      el.verticalAlign = 'top';
      el.horizontalAlign = 'left';
      el.fitInto = constrain;
      el.refit();
      const rect = el.getBoundingClientRect();
      const crect = constrain.getBoundingClientRect();
      assert.equal(rect.top, crect.top, 'top ok');
      assert.equal(rect.left, crect.left, 'left ok');
    });
  });

  describe('horizontal/vertical align', () => {
    let parent;
    let parentRect;
    let el;
    let elRect;
    const fitRect = {
      left: 0,
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      width: window.innerWidth,
      height: window.innerHeight
    };

    beforeEach(async () => {
      parent = await constrainTargetFixture();
      await nextFrame();
      parentRect = parent.getBoundingClientRect();
      el = parent.querySelector('.el');
      elRect = el.getBoundingClientRect();
    });

    it('intersects works', function() {
      const base = {
        top: 0,
        bottom: 1,
        left: 0,
        right: 1
      };
      assert.isTrue(intersects(base, base), 'intersects itself');
      assert.isFalse(
        intersects(base, {
          top: 1,
          bottom: 2,
          left: 0,
          right: 1
        }),
        'no intersect on edge');
      assert.isFalse(
        intersects(base, {
          top: -2,
          bottom: -1,
          left: 0,
          right: 1
        }),
        'no intersect on edge (negative values)');
      assert.isFalse(
        intersects(base, {
          top: 2,
          bottom: 3,
          left: 0,
          right: 1
        }),
        'no intersect');
    });

    describe('when verticalAlign is top', function() {
      it('element is aligned to the positionTarget top', function() {
        el.verticalAlign = 'top';
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.top, parentRect.top, 'top ok');
        assert.equal(rect.height, elRect.height, 'no cropping');
      });

      it('element is aligned to the positionTarget top without overlapping it', function() {
        // Allow enough space on the parent's bottom & right.
        parent.style.width = '10px';
        parent.style.height = '10px';
        parentRect = parent.getBoundingClientRect();
        el.verticalAlign = 'top';
        el.noOverlap = true;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.isFalse(intersects(rect, parentRect), 'no overlap');
        assert.equal(rect.height, elRect.height, 'no cropping');
      });

      it('element margin is considered as offset', function() {
        el.verticalAlign = 'top';
        el.style.marginTop = '10px';
        el.refit();
        let rect = el.getBoundingClientRect();
        assert.equal(rect.top, parentRect.top + 10, 'top ok');
        assert.equal(rect.height, elRect.height, 'no cropping');
        el.style.marginTop = '-10px';
        el.refit();
        rect = el.getBoundingClientRect();
        assert.equal(rect.top, parentRect.top - 10, 'top ok');
        assert.equal(rect.height, elRect.height, 'no cropping');
      });

      it('verticalOffset is applied', function() {
        el.verticalAlign = 'top';
        el.verticalOffset = 10;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.top, parentRect.top + 10, 'top ok');
        assert.equal(rect.height, elRect.height, 'no cropping');
      });

      it('element is kept in viewport', function() {
        el.verticalAlign = 'top';
        // Make it go out of screen
        el.verticalOffset = -1000;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.top, 0, 'top in viewport');
        assert.isTrue(rect.height < elRect.height, 'reduced size');
      });

      it('negative verticalOffset does not crop element', function() {
        // Push to the bottom of the screen.
        parent.style.top = (window.innerHeight - 50) + 'px';
        el.verticalAlign = 'top';
        el.verticalOffset = -10;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.top, window.innerHeight - 60, 'top ok');
        assert.equal(rect.bottom, window.innerHeight, 'bottom ok');
      });
      it('max-height is updated', function() {
        parent.style.top = '-10px';
        el.verticalAlign = 'top';
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.top, 0, 'top ok');
        assert.isBelow(rect.height, elRect.height, 'height ok');
      });

      it('min-height is preserved: element is displayed even if partially', function() {
        parent.style.top = '-10px';
        el.verticalAlign = 'top';
        el.style.minHeight = elRect.height + 'px';
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.top, 0, 'top ok');
        assert.equal(rect.height, elRect.height, 'min-height ok');
        assert.isTrue(intersects(rect, fitRect), 'partially visible');
      });

      it('dynamicAlign will prefer bottom align if it minimizes the cropping', function() {
        parent.style.top = '-10px';
        parentRect = parent.getBoundingClientRect();
        el.verticalAlign = 'top';
        el.dynamicAlign = true;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.bottom, parentRect.bottom, 'bottom ok');
        assert.equal(rect.height, elRect.height, 'no cropping');
      });
    });

    describe('when verticalAlign is bottom', function() {
      it('element is aligned to the positionTarget bottom', function() {
        el.verticalAlign = 'bottom';
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.bottom, parentRect.bottom, 'bottom ok');
        assert.equal(rect.height, elRect.height, 'no cropping');
      });

      it('element is aligned to the positionTarget bottom without overlapping it', function() {
        el.verticalAlign = 'bottom';
        el.noOverlap = true;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.isFalse(intersects(rect, parentRect), 'no overlap');
        assert.equal(rect.height, elRect.height, 'no cropping');
      });

      it('element margin is considered as offset', function() {
        el.verticalAlign = 'bottom';
        el.style.marginBottom = '10px';
        el.refit();
        let rect = el.getBoundingClientRect();
        assert.equal(rect.bottom, parentRect.bottom - 10, 'bottom ok');
        assert.equal(rect.height, elRect.height, 'no cropping');
        el.style.marginBottom = '-10px';
        el.refit();
        rect = el.getBoundingClientRect();
        assert.equal(rect.bottom, parentRect.bottom + 10, 'bottom ok');
        assert.equal(rect.height, elRect.height, 'no cropping');
      });

      it('verticalOffset is applied', function() {
        el.verticalAlign = 'bottom';
        el.verticalOffset = 10;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.bottom, parentRect.bottom - 10, 'bottom ok');
        assert.equal(rect.height, elRect.height, 'no cropping');
      });

      it('element is kept in viewport', function() {
        el.verticalAlign = 'bottom';
        // Make it go out of screen
        el.verticalOffset = 1000;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.top, 0, 'top in viewport');
        assert.isTrue(rect.height < elRect.height, 'reduced size');
      });

      it('element max-height is updated', function() {
        parent.style.top = (100 - parentRect.height) + 'px';
        el.verticalAlign = 'bottom';
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.bottom, 100, 'bottom ok');
        assert.equal(rect.height, 100, 'height ok');
      });

      it('min-height is preserved: element is displayed even if partially', function() {
        parent.style.top = (elRect.height - 10 - parentRect.height) + 'px';
        el.verticalAlign = 'bottom';
        el.style.minHeight = elRect.height + 'px';
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.top, 0, 'top ok');
        assert.equal(rect.height, elRect.height, 'min-height ok');
        assert.isTrue(intersects(rect, fitRect), 'partially visible');
      });

      it('dynamicAlign will prefer top align if it minimizes the cropping', function() {
        parent.style.top = (window.innerHeight - elRect.height) + 'px';
        parentRect = parent.getBoundingClientRect();
        el.verticalAlign = 'bottom';
        el.dynamicAlign = true;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.top, parentRect.top, 'top ok');
        assert.equal(rect.height, elRect.height, 'no cropping');
      });
    });

    describe('when verticalAlign is middle', function() {
      it('element is aligned to the positionTarget middle', function() {
        el.verticalAlign = 'middle';
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(
          rect.top,
          parentRect.top + (parentRect.height - rect.height) / 2,
          'top ok');
        assert.equal(rect.height, elRect.height, 'no cropping');
      });

      it('element is aligned to the positionTarget top without overlapping it', function() {
        // Allow enough space on the parent's bottom & right.
        el.verticalAlign = 'middle';
        el.noOverlap = true;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.isFalse(intersects(rect, parentRect), 'no overlap');
        assert.equal(rect.height, elRect.height, 'no cropping');
      });

      it('element margin is considered as offset', function() {
        el.verticalAlign = 'middle';
        el.style.marginTop = '10px';
        el.refit();
        let rect = el.getBoundingClientRect();
        assert.equal(
          rect.top,
          parentRect.top + (parentRect.height - rect.height) / 2 + 10,
          'top ok');
        assert.equal(rect.height, elRect.height, 'no cropping');
        el.style.marginTop = '-10px';
        el.refit();
        rect = el.getBoundingClientRect();
        assert.equal(
          rect.top,
          parentRect.top + (parentRect.height - rect.height) / 2 - 10,
          'top ok');
        assert.equal(rect.height, elRect.height, 'no cropping');
      });

      it('verticalOffset is applied', function() {
        el.verticalAlign = 'middle';
        el.verticalOffset = 10;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(
          rect.top,
          parentRect.top + (parentRect.height - rect.height) / 2 + 10,
          'top ok');
        assert.equal(rect.height, elRect.height, 'no cropping');
      });

      it('element is kept in viewport', function() {
        el.verticalAlign = 'middle';
        // Make it go out of screen
        el.verticalOffset = -1000;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.top, 0, 'top in viewport');
        assert.isTrue(rect.height < elRect.height, 'reduced size');
      });

      it('negative verticalOffset does not crop element', function() {
        // Push to the bottom of the screen.
        parent.style.top = (window.innerHeight - 50) + 'px';
        el.verticalAlign = 'middle';
        el.verticalOffset = -10;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.top, window.innerHeight - 35, 'top ok');
        assert.equal(rect.bottom, window.innerHeight, 'bottom ok');
      });

      it('max-height is updated', function() {
        parent.style.top = '-50px';
        el.verticalAlign = 'middle';
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.top, 0, 'top ok');
        assert.isBelow(rect.height, elRect.height, 'height ok');
      });

      it('min-height is preserved: element is displayed even if partially', function() {
        parent.style.top = '-50px';
        el.verticalAlign = 'middle';
        el.style.minHeight = elRect.height + 'px';
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.top, 0, 'top ok');
        assert.equal(rect.height, elRect.height, 'min-height ok');
        assert.isTrue(intersects(rect, fitRect), 'partially visible');
      });

      it('dynamicAlign will prefer bottom align if it minimizes the cropping', function() {
        parent.style.top = '-50px';
        parentRect = parent.getBoundingClientRect();
        el.verticalAlign = 'middle';
        el.dynamicAlign = true;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.bottom, parentRect.bottom, 'bottom ok');
        assert.equal(rect.height, elRect.height, 'no cropping');
      });
    });

    describe('when verticalAlign is auto', function() {
      it('element is aligned to the positionTarget top', function() {
        el.verticalAlign = 'auto';
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.top, parentRect.top, 'auto aligned to top');
        assert.equal(rect.height, elRect.height, 'no cropping');
      });

      it('element is aligned to the positionTarget top without overlapping it', function() {
        // Allow enough space on the parent's bottom & right.
        parent.style.width = '10px';
        parent.style.height = '10px';
        parentRect = parent.getBoundingClientRect();
        el.verticalAlign = 'auto';
        el.noOverlap = true;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.height, elRect.height, 'no cropping');
        assert.isFalse(intersects(rect, parentRect), 'no overlap');
      });

      it('bottom is preferred to top if it diminishes the cropped area', function() {
        // This would cause a cropping of the element, so it should
        // automatically align to the bottom to avoid it.
        parent.style.top = '-10px';
        parentRect = parent.getBoundingClientRect();
        el.verticalAlign = 'auto';
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(
          rect.bottom, parentRect.bottom, 'auto aligned to bottom');
        assert.equal(rect.height, elRect.height, 'no cropping');
      });

      it('bottom is preferred to top if it diminishes the cropped area, without overlapping positionTarget',
        function() {
          // This would cause a cropping of the element, so it should
          // automatically align to the bottom to avoid it.
          parent.style.top = '-10px';
          parentRect = parent.getBoundingClientRect();
          el.verticalAlign = 'auto';
          el.noOverlap = true;
          el.refit();
          const rect = el.getBoundingClientRect();
          assert.equal(rect.height, elRect.height, 'no cropping');
          assert.isFalse(intersects(rect, parentRect), 'no overlap');
        });
    });

    describe('when horizontalAlign is left', function() {
      it('element is aligned to the positionTarget left', function() {
        el.horizontalAlign = 'left';
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.left, parentRect.left, 'left ok');
        assert.equal(rect.width, elRect.width, 'no cropping');
      });

      it('element is aligned to the positionTarget left without overlapping it', function() {
        // Make space at the parent's right.
        parent.style.width = '10px';
        parentRect = parent.getBoundingClientRect();
        el.horizontalAlign = 'left';
        el.noOverlap = true;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.isFalse(intersects(rect, parentRect), 'no overlap');
        assert.equal(rect.width, elRect.width, 'no cropping');
      });

      it('element margin is considered as offset', function() {
        el.horizontalAlign = 'left';
        el.style.marginLeft = '10px';
        el.refit();
        let rect = el.getBoundingClientRect();
        assert.equal(rect.left, parentRect.left + 10, 'left ok');
        assert.equal(rect.width, elRect.width, 'no cropping');
        el.style.marginLeft = '-10px';
        el.refit();
        rect = el.getBoundingClientRect();
        assert.equal(rect.left, parentRect.left - 10, 'left ok');
        assert.equal(rect.width, elRect.width, 'no cropping');
      });

      it('horizontalOffset is applied', function() {
        el.horizontalAlign = 'left';
        el.horizontalOffset = 10;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.left, parentRect.left + 10, 'left ok');
        assert.equal(rect.width, elRect.width, 'no cropping');
      });

      it('element is kept in viewport', function() {
        el.horizontalAlign = 'left';
        // Make it go out of screen.
        el.horizontalOffset = -1000;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.left, 0, 'left in viewport');
        assert.isTrue(rect.width < elRect.width, 'reduced size');
      });

      it('negative horizontalOffset does not crop element', function() {
        // Push to the bottom of the screen.
        parent.style.left = (window.innerWidth - 50) + 'px';
        el.horizontalAlign = 'left';
        el.horizontalOffset = -10;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.left, window.innerWidth - 60, 'left ok');
        assert.equal(rect.right, window.innerWidth, 'right ok');
      });

      it('element max-width is updated', function() {
        parent.style.left = '-10px';
        el.horizontalAlign = 'left';
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.left, 0, 'left ok');
        assert.isBelow(rect.width, elRect.width, 'width ok');
      });

      it('min-width is preserved: element is displayed even if partially', function() {
        parent.style.left = '-10px';
        el.style.minWidth = elRect.width + 'px';
        el.horizontalAlign = 'left';
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.left, 0, 'left ok');
        assert.equal(rect.width, elRect.width, 'min-width ok');
        assert.isTrue(intersects(rect, fitRect), 'partially visible');
      });

      it('dynamicAlign will prefer right align if it minimizes the cropping', function() {
        parent.style.left = '-10px';
        parentRect = parent.getBoundingClientRect();
        el.horizontalAlign = 'left';
        el.dynamicAlign = true;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.right, parentRect.right, 'right ok');
        assert.equal(rect.height, elRect.height, 'no cropping');
      });
    });

    describe('when horizontalAlign is right', function() {
      it('element is aligned to the positionTarget right', function() {
        el.horizontalAlign = 'right';
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.right, parentRect.right, 'right ok');
        assert.equal(rect.width, elRect.width, 'no cropping');
      });

      it('element is aligned to the positionTarget right without overlapping it', function() {
        // Make space at the parent's left.
        parent.style.left = elRect.width + 'px';
        parentRect = parent.getBoundingClientRect();
        el.horizontalAlign = 'right';
        el.noOverlap = true;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.isFalse(intersects(rect, parentRect), 'no overlap');
        assert.equal(rect.width, elRect.width, 'no cropping');
      });

      it('element margin is considered as offset', function() {
        el.horizontalAlign = 'right';
        el.style.marginRight = '10px';
        el.refit();
        let rect = el.getBoundingClientRect();
        assert.equal(rect.right, parentRect.right - 10, 'right ok');
        assert.equal(rect.width, elRect.width, 'no cropping');
        el.style.marginRight = '-10px';
        el.refit();
        rect = el.getBoundingClientRect();
        assert.equal(rect.right, parentRect.right + 10, 'right ok');
        assert.equal(rect.width, elRect.width, 'no cropping');
      });

      it('horizontalOffset is applied', function() {
        el.horizontalAlign = 'right';
        el.horizontalOffset = 10;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.right, parentRect.right - 10, 'right ok');
        assert.equal(rect.width, elRect.width, 'no cropping');
      });

      it('element is kept in viewport', function() {
        el.horizontalAlign = 'right';
        // Make it go out of screen.
        el.horizontalOffset = 1000;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.left, 0, 'left in viewport');
        assert.isTrue(rect.width < elRect.width, 'reduced width');
      });

      it('element max-width is updated', function() {
        parent.style.left = (100 - parentRect.width) + 'px';
        el.horizontalAlign = 'right';
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.right, 100, 'right ok');
        assert.equal(rect.width, 100, 'width ok');
      });

      it('min-width is preserved: element is displayed even if partially', function() {
        parent.style.left = (elRect.width - 10 - parentRect.width) + 'px';
        el.horizontalAlign = 'right';
        el.style.minWidth = elRect.width + 'px';
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.left, 0, 'left ok');
        assert.equal(rect.width, elRect.width, 'min-width ok');
        assert.isTrue(intersects(rect, fitRect), 'partially visible');
      });

      it('dynamicAlign will prefer left align if it minimizes the cropping', function() {
        parent.style.left = (window.innerWidth - elRect.width) + 'px';
        parentRect = parent.getBoundingClientRect();
        el.horizontalAlign = 'right';
        el.dynamicAlign = true;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.left, parentRect.left, 'left ok');
        assert.equal(rect.height, elRect.height, 'no cropping');
      });
    });

    describe('when horizontalAlign is center', function() {
      it('element is aligned to the positionTarget center', function() {
        el.horizontalAlign = 'center';
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(
          rect.left,
          parentRect.left + (parentRect.width - rect.width) / 2,
          'left ok');
        assert.equal(rect.width, elRect.width, 'no cropping');
      });

      it('element is aligned to the positionTarget left without overlapping it', function() {
        el.horizontalAlign = 'center';
        el.noOverlap = true;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.isFalse(intersects(rect, parentRect), 'no overlap');
        assert.equal(rect.width, elRect.width, 'no cropping');
      });

      it('element margin is considered as offset', function() {
        el.horizontalAlign = 'center';
        el.style.marginLeft = '10px';
        el.refit();
        let rect = el.getBoundingClientRect();
        assert.equal(
          rect.left,
          parentRect.left + (parentRect.width - rect.width) / 2 + 10,
          'left ok');
        assert.equal(rect.width, elRect.width, 'no cropping');
        el.style.marginLeft = '-10px';
        el.refit();
        rect = el.getBoundingClientRect();
        assert.equal(
          rect.left,
          parentRect.left + (parentRect.width - rect.width) / 2 - 10,
          'left ok');
        assert.equal(rect.width, elRect.width, 'no cropping');
      });

      it('horizontalOffset is applied', function() {
        el.horizontalAlign = 'center';
        el.horizontalOffset = 10;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(
          rect.left,
          parentRect.left + (parentRect.width - rect.width) / 2 + 10,
          'left ok');
        assert.equal(rect.width, elRect.width, 'no cropping');
      });

      it('element is kept in viewport', function() {
        el.horizontalAlign = 'center';
        // Make it go out of screen.
        el.horizontalOffset = -1000;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.left, 0, 'left in viewport');
        assert.isTrue(rect.width < elRect.width, 'reduced size');
      });

      it('negative horizontalOffset does not crop element', function() {
        // Push to the bottom of the screen.
        parent.style.left = (window.innerWidth - 50) + 'px';
        el.horizontalAlign = 'center';
        el.horizontalOffset = -10;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.left, window.innerWidth - 35, 'left ok');
        assert.equal(rect.right, window.innerWidth, 'right ok');
      });

      it('element max-width is updated', function() {
        parent.style.left = '-50px';
        el.horizontalAlign = 'center';
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.left, 0, 'left ok');
        assert.isBelow(rect.width, elRect.width, 'width ok');
      });

      it('min-width is preserved: element is displayed even if partially', function() {
        parent.style.left = '-50px';
        el.style.minWidth = elRect.width + 'px';
        el.horizontalAlign = 'center';
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.left, 0, 'left ok');
        assert.equal(rect.width, elRect.width, 'min-width ok');
        assert.isTrue(intersects(rect, fitRect), 'partially visible');
      });

      it('dynamicAlign will prefer right align if it minimizes the cropping', function() {
        parent.style.left = '-50px';
        parentRect = parent.getBoundingClientRect();
        el.horizontalAlign = 'center';
        el.dynamicAlign = true;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.right, parentRect.right, 'right ok');
        assert.equal(rect.height, elRect.height, 'no cropping');
      });
    });

    describe('when horizontalAlign is auto', function() {
      it('element is aligned to the positionTarget left', function() {
        el.horizontalAlign = 'auto';
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.left, parentRect.left, 'auto aligned to left');
        assert.equal(rect.width, elRect.width, 'no cropping');
      });

      it('element is aligned to the positionTarget left without overlapping positionTarget', function() {
        // Make space at the parent's left.
        parent.style.left = elRect.width + 'px';
        parentRect = parent.getBoundingClientRect();
        el.horizontalAlign = 'auto';
        el.noOverlap = true;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.width, elRect.width, 'no cropping');
        assert.isFalse(intersects(rect, parentRect), 'no overlap');
      });

      it('right is preferred to left if it diminishes the cropped area', function() {
        // This would cause a cropping of the element, so it should
        // automatically align to the right to avoid it.
        parent.style.left = '-10px';
        parentRect = parent.getBoundingClientRect();
        el.horizontalAlign = 'auto';
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.right, parentRect.right, 'auto aligned to right');
        assert.equal(rect.width, elRect.width, 'no cropping');
      });

      it('right is preferred to left if it diminishes the cropped area, without overlapping positionTarget', () => {
        // Make space at the parent's right.
        parent.style.width = '10px';
        parentRect = parent.getBoundingClientRect();
        el.horizontalAlign = 'auto';
        el.noOverlap = true;
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.width, elRect.width, 'no cropping');
        assert.isFalse(intersects(rect, parentRect), 'no overlap');
      });
    });

    describe('when horizontalAlign is center and verticalAling is middle', function() {
      it('element is aligned to the positionTarget center', function() {
        el.horizontalAlign = 'center';
        el.verticalAlign = 'middle';
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(
            rect.left,
            parentRect.left + (parentRect.width - rect.width) / 2,
            'left ok');
        assert.equal(
            rect.top,
            parentRect.top + (parentRect.height - rect.height) / 2,
            'top ok');
        assert.equal(rect.width, elRect.width, 'no cropping');
      });
    });

    describe('prefer horizontal overlap to vertical overlap', function() {
      beforeEach(function() {
        el.noOverlap = true;
        el.dynamicAlign = true;
        // Make space around the positionTarget.
        parent.style.top = elRect.height + 'px';
        parent.style.left = elRect.width + 'px';
        parent.style.width = '10px';
        parent.style.height = '10px';
        parentRect = parent.getBoundingClientRect();
      });

      it('top-left aligns to target bottom-left', function() {
        el.verticalAlign = 'top';
        el.horizontalAlign = 'left';
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.left, parentRect.left, 'left ok');
        assert.equal(rect.top, parentRect.bottom, 'top ok');
      });

      it('top-right aligns to target bottom-right', function() {
        el.verticalAlign = 'top';
        el.horizontalAlign = 'right';
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.right, parentRect.right, 'right ok');
        assert.equal(rect.top, parentRect.bottom, 'top ok');
      });

      it('bottom-left aligns to target top-left', function() {
        el.verticalAlign = 'bottom';
        el.horizontalAlign = 'left';
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.left, parentRect.left, 'left ok');
        assert.equal(rect.bottom, parentRect.top, 'bottom ok');
      });

      it('bottom-right aligns to target top-right', function() {
        el.verticalAlign = 'bottom';
        el.horizontalAlign = 'right';
        el.refit();
        const rect = el.getBoundingClientRect();
        assert.equal(rect.right, parentRect.right, 'right ok');
        assert.equal(rect.bottom, parentRect.top, 'bottom ok');
      });
    });
  });

  describe('Attributes compatibility', () => {
    it('Sets legacy sizing-target in the template', async () => {
      const node = document.createElement('span');
      const el = await fixture(html`<test-fit .sizing-target="${node}"></test-fit>`);
      assert.isTrue(el.sizingTarget === node);
    });

    it('Gets legacy sizing-target in the template', async () => {
      const node = document.createElement('span');
      const el = await fixture(html`<test-fit .sizing-target="${node}"></test-fit>`);
      assert.isTrue(el['sizing-target'] === node);
    });

    it('Sets legacy fit-into in the template', async () => {
      const node = document.createElement('span');
      const el = await fixture(html`<test-fit .fit-into="${node}"></test-fit>`);
      assert.isTrue(el.fitInto === node);
    });

    it('Gets legacy fit-into', async () => {
      const node = document.createElement('span');
      const el = await fixture(html`<test-fit .fit-into="${node}"></test-fit>`);
      assert.isTrue(el['fit-into'] === node);
    });

    it('Sets legacy no-overlap in the template from a variable', async () => {
      const el = await fixture(html`<test-fit ?no-overlap="${true}"></test-fit>`);
      assert.isTrue(el.noOverlap);
    });

    it('Sets legacy no-overlap in the template from a literal', async () => {
      const el = await fixture(html`<test-fit no-overlap></test-fit>`);
      assert.isTrue(el.noOverlap);
    });

    it('Gets legacy _oldNoOverlap', async () => {
      const el = await fixture(html`<test-fit ?no-overlap="${true}"></test-fit>`);
      assert.isTrue(el._oldNoOverlap);
    });

    it('Sets legacy position-target in the template', async () => {
      const node = document.createElement('span');
      const el = await fixture(html`<test-fit .position-target="${node}"></test-fit>`);
      assert.isTrue(el.positionTarget === node);
    });

    it('Gets legacy position-target in the template', async () => {
      const node = document.createElement('span');
      const el = await fixture(html`<test-fit .position-target="${node}"></test-fit>`);
      assert.isTrue(el['position-target'] === node);
    });

    it('Sets legacy horizontal-align in the template from a variable', async () => {
      const value = 'auto';
      const el = await fixture(html`<test-fit .horizontal-align="${value}"></test-fit>`);
      assert.equal(el.horizontalAlign, value);
    });

    it('Sets legacy horizontal-align in the template from a literal', async () => {
      const el = await fixture(html`<test-fit horizontal-align="auto"></test-fit>`);
      assert.equal(el.horizontalAlign, 'auto');
    });

    it('Gets legacy horizontal-align', async () => {
      const el = await fixture(html`<test-fit horizontal-align="auto"></test-fit>`);
      assert.equal(el['horizontal-align'], 'auto');
    });

    it('Gets legacy horizontal-align', async () => {
      const el = await fixture(html`<test-fit horizontal-align="auto"></test-fit>`);
      assert.equal(el._oldHorizontalAlign, 'auto');
    });

    it('Sets legacy vertical-align in the template from a variable', async () => {
      const value = 'auto';
      const el = await fixture(html`<test-fit .vertical-align="${value}"></test-fit>`);
      assert.equal(el.verticalAlign, value);
    });

    it('Sets legacy vertical-align in the template from a literal', async () => {
      const value = 'auto';
      const el = await fixture(html`<test-fit vertical-align="auto"></test-fit>`);
      assert.equal(el.verticalAlign, value);
    });

    it('Gets legacy vertical-align', async () => {
      const value = 'auto';
      const el = await fixture(html`<test-fit vertical-align="auto"></test-fit>`);
      assert.equal(el['vertical-align'], value);
    });

    it('Gets legacy _oldVerticalAlign', async () => {
      const value = 'auto';
      const el = await fixture(html`<test-fit vertical-align="auto"></test-fit>`);
      assert.equal(el._oldVerticalAlign, value);
    });

    it('Sets legacy dynamic-align in the template from a variable', async () => {
      const el = await fixture(html`<test-fit ?dynamic-align="${true}"></test-fit>`);
      assert.isTrue(el.dynamicAlign);
    });

    it('Sets legacy dynamic-align in the template from a literal', async () => {
      const el = await fixture(html`<test-fit dynamic-align></test-fit>`);
      assert.isTrue(el.dynamicAlign);
    });

    it('Gets legacy dynamic-align', async () => {
      const el = await fixture(html`<test-fit dynamic-align></test-fit>`);
      assert.isTrue(el._oldDynamicAlign);
    });

    it('Sets legacy horizontal-offset in the template from a variable', async () => {
      const value = 42;
      const el = await fixture(html`<test-fit .horizontal-offset="${value}"></test-fit>`);
      assert.equal(el.horizontalOffset, value);
    });

    it('Sets legacy horizontal-offset in the template from a literal', async () => {
      const el = await fixture(html`<test-fit horizontal-offset="42"></test-fit>`);
      assert.equal(el.horizontalOffset, 42);
    });

    it('Gets legacy horizontal-offset', async () => {
      const el = await fixture(html`<test-fit horizontal-offset="42"></test-fit>`);
      assert.equal(el['horizontal-offset'], 42);
    });

    it('Gets legacy _oldHorizontalOffset', async () => {
      const el = await fixture(html`<test-fit horizontal-offset="42"></test-fit>`);
      assert.equal(el._oldHorizontalOffset, 42);
    });

    it('Sets legacy vertical-offset in the template from a variable', async () => {
      const value = 42;
      const el = await fixture(html`<test-fit .vertical-offset="${value}"></test-fit>`);
      assert.equal(el.verticalOffset, value);
    });

    it('Sets legacy vertical-offset in the template from a literal', async () => {
      const el = await fixture(html`<test-fit vertical-offset="42"></test-fit>`);
      assert.equal(el.verticalOffset, 42);
    });

    it('Gets legacy vertical-offset', async () => {
      const el = await fixture(html`<test-fit vertical-offset="42"></test-fit>`);
      assert.equal(el['vertical-offset'], 42);
    });

    it('Gets legacy _oldVerticalOffset', async () => {
      const el = await fixture(html`<test-fit vertical-offset="42"></test-fit>`);
      assert.equal(el._oldVerticalOffset, 42);
    });

    it('Sets legacy auto-fit-on-attach in the template from a variable', async () => {
      const el = await fixture(html`<test-fit ?auto-fit-on-attach="${true}"></test-fit>`);
      assert.isTrue(el.autoFitOnAttach);
    });

    it('Sets legacy auto-fit-on-attach in the template from a literal', async () => {
      const el = await fixture(html`<test-fit auto-fit-on-attach></test-fit>`);
      assert.isTrue(el.autoFitOnAttach);
    });

    it('Gets legacy auto-fit-on-attach', async () => {
      const el = await fixture(html`<test-fit auto-fit-on-attach></test-fit>`);
      assert.isTrue(el._oldAutoFitOnAttach);
    });
  });
});
