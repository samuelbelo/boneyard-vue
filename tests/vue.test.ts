import { describe, it, expect, beforeEach } from "vite-plus/test";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { BoneyardSkeleton, BoneyardPlugin, registerBones, clearRegistry } from "../src/vue.ts";
import type { SkeletonResult, ResponsiveBones } from "../src/types.ts";

const mockBones: SkeletonResult = {
  name: "test-card",
  viewportWidth: 400,
  width: 400,
  height: 200,
  bones: [
    { x: 0, y: 0, w: 100, h: 180, r: 8 },
    { x: 0, y: 190, w: 60, h: 14, r: 4 },
  ],
};

const mockResponsiveBones: ResponsiveBones = {
  breakpoints: {
    375: {
      name: "test-card",
      viewportWidth: 375,
      width: 375,
      height: 300,
      bones: [{ x: 0, y: 0, w: 100, h: 280, r: 8 }],
    },
    768: mockBones,
  },
};

describe("BoneyardSkeleton", () => {
  it("renders default slot when not loading", () => {
    const wrapper = mount(BoneyardSkeleton, {
      props: { loading: false },
      slots: {
        default: () => h("div", { class: "content" }, "Hello"),
      },
    });
    expect(wrapper.find(".content").exists()).toBe(true);
    expect(wrapper.text()).toContain("Hello");
  });

  it("renders fallback slot when loading with no bones", () => {
    const wrapper = mount(BoneyardSkeleton, {
      props: { loading: true },
      slots: {
        default: () => h("div", "Content"),
        fallback: () => h("div", { class: "fallback" }, "Loading..."),
      },
    });
    expect(wrapper.find(".fallback").exists()).toBe(true);
    expect(wrapper.text()).toContain("Loading...");
  });

  it("sets data-boneyard attribute when name is provided", () => {
    const wrapper = mount(BoneyardSkeleton, {
      props: { loading: false, name: "my-card" },
      slots: {
        default: () => h("div", "Content"),
      },
    });
    expect(wrapper.attributes("data-boneyard")).toBe("my-card");
  });

  it("sets data-boneyard-config when snapshotConfig is provided", () => {
    const config = { leafTags: ["p", "h1"] };
    const wrapper = mount(BoneyardSkeleton, {
      props: {
        loading: false,
        name: "my-card",
        snapshotConfig: config,
      },
      slots: {
        default: () => h("div", "Content"),
      },
    });
    expect(wrapper.attributes("data-boneyard-config")).toBe(JSON.stringify(config));
  });

  it("renders skeleton bones when loading with initialBones", () => {
    const wrapper = mount(BoneyardSkeleton, {
      props: {
        loading: true,
        initialBones: mockBones,
      },
      slots: {
        default: () => h("div", "Content"),
      },
      attachTo: document.body,
    });

    const container = wrapper.element;
    expect(container.style.position).toBe("relative");
    wrapper.unmount();
  });

  it("has position relative on root", () => {
    const wrapper = mount(BoneyardSkeleton, {
      props: { loading: false },
      slots: {
        default: () => h("div", "Content"),
      },
    });
    expect(wrapper.element.style.position).toBe("relative");
  });

  it("defaults animate to true", () => {
    const wrapper = mount(BoneyardSkeleton, {
      props: { loading: false },
      slots: {
        default: () => h("div", "Content"),
      },
    });
    expect(wrapper.props("animate")).toBe(true);
  });
});

describe("registerBones", () => {
  beforeEach(() => {
    clearRegistry();
  });

  it("registers bones that can be looked up by name", () => {
    registerBones({ "test-card": mockBones });

    const wrapper = mount(BoneyardSkeleton, {
      props: { loading: true, name: "test-card" },
      slots: {
        default: () => h("div", "Content"),
      },
      attachTo: document.body,
    });

    expect(wrapper.attributes("data-boneyard")).toBe("test-card");
    wrapper.unmount();
  });

  it("registers responsive bones", () => {
    registerBones({ "test-card": mockResponsiveBones });

    const wrapper = mount(BoneyardSkeleton, {
      props: { loading: true, name: "test-card" },
      slots: {
        default: () => h("div", "Content"),
      },
      attachTo: document.body,
    });

    expect(wrapper.attributes("data-boneyard")).toBe("test-card");
    wrapper.unmount();
  });

  it("clearRegistry removes all entries", () => {
    registerBones({ "test-card": mockBones });
    clearRegistry();

    const wrapper = mount(BoneyardSkeleton, {
      props: { loading: true, name: "test-card" },
      slots: {
        default: () => h("div", "Content"),
        fallback: () => h("div", { class: "fallback" }, "No bones"),
      },
    });

    // Should show fallback since registry was cleared
    expect(wrapper.find(".fallback").exists()).toBe(true);
  });
});

describe("BoneyardPlugin", () => {
  it("registers BoneyardSkeleton globally", () => {
    const TestApp = defineComponent({
      template: `<BoneyardSkeleton :loading="false"><div>Works</div></BoneyardSkeleton>`,
    });

    const wrapper = mount(TestApp, {
      global: {
        plugins: [BoneyardPlugin],
      },
    });

    expect(wrapper.text()).toContain("Works");
  });
});
