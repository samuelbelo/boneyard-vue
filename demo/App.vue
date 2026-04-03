<script setup lang="ts">
import { ref } from "vue";
import type { SkeletonResult, ResponsiveBones } from "../src/types.ts";
import { registerBones } from "../src/vue.ts";

const loading = ref(true);
const darkMode = ref(false);
const animate = ref(true);

function toggleLoading() {
  loading.value = !loading.value;
}

function toggleDark() {
  darkMode.value = !darkMode.value;
  document.body.classList.toggle("dark", darkMode.value);
}

function toggleAnimate() {
  animate.value = !animate.value;
}

function simulateFetch() {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 2000);
}

// Pre-generated bones for the demo (simulating what the CLI would produce)
const blogCardBones: SkeletonResult = {
  name: "blog-card",
  viewportWidth: 400,
  width: 400,
  height: 280,
  bones: [
    { x: 0, y: 0, w: 100, h: 160, r: 8 },
    { x: 4, y: 172, w: 92, h: 20, r: 4 },
    { x: 4, y: 200, w: 70, h: 14, r: 4 },
    { x: 4, y: 224, w: 85, h: 14, r: 4 },
    { x: 4, y: 252, w: 30, h: 12, r: 4 },
  ],
};

const profileCardBones: SkeletonResult = {
  name: "profile-card",
  viewportWidth: 400,
  width: 400,
  height: 120,
  bones: [
    { x: 4, y: 12, w: 20, h: 80, r: "50%" },
    { x: 28, y: 16, w: 40, h: 18, r: 4 },
    { x: 28, y: 42, w: 55, h: 14, r: 4 },
    { x: 28, y: 64, w: 30, h: 12, r: 4 },
    { x: 75, y: 16, w: 20, h: 32, r: 6 },
  ],
};

const statsCardBones: SkeletonResult = {
  name: "stats-card",
  viewportWidth: 400,
  width: 400,
  height: 100,
  bones: [
    { x: 4, y: 12, w: 30, h: 12, r: 4 },
    { x: 4, y: 32, w: 50, h: 28, r: 4 },
    { x: 4, y: 70, w: 92, h: 16, r: 4 },
  ],
};

const chatBones: SkeletonResult = {
  name: "chat-messages",
  viewportWidth: 400,
  width: 400,
  height: 240,
  bones: [
    { x: 2, y: 8, w: 8, h: 32, r: "50%" },
    { x: 12, y: 8, w: 55, h: 32, r: 12 },
    { x: 35, y: 52, w: 60, h: 32, r: 12 },
    { x: 90, y: 52, w: 8, h: 32, r: "50%" },
    { x: 2, y: 96, w: 8, h: 32, r: "50%" },
    { x: 12, y: 96, w: 40, h: 32, r: 12 },
    { x: 45, y: 140, w: 50, h: 48, r: 12 },
    { x: 90, y: 148, w: 8, h: 32, r: "50%" },
    { x: 2, y: 200, w: 8, h: 32, r: "50%" },
    { x: 12, y: 200, w: 35, h: 32, r: 12 },
  ],
};

const tableBones: SkeletonResult = {
  name: "data-table",
  viewportWidth: 400,
  width: 400,
  height: 220,
  bones: [
    { x: 2, y: 0, w: 96, h: 36, r: 4, c: true },
    { x: 4, y: 8, w: 15, h: 12, r: 3 },
    { x: 22, y: 8, w: 20, h: 12, r: 3 },
    { x: 45, y: 8, w: 18, h: 12, r: 3 },
    { x: 68, y: 8, w: 25, h: 12, r: 3 },
    { x: 4, y: 48, w: 12, h: 10, r: 3 },
    { x: 22, y: 48, w: 18, h: 10, r: 3 },
    { x: 45, y: 48, w: 10, h: 10, r: 3 },
    { x: 68, y: 48, w: 20, h: 10, r: 3 },
    { x: 4, y: 70, w: 14, h: 10, r: 3 },
    { x: 22, y: 70, w: 22, h: 10, r: 3 },
    { x: 45, y: 70, w: 15, h: 10, r: 3 },
    { x: 68, y: 70, w: 18, h: 10, r: 3 },
    { x: 4, y: 92, w: 10, h: 10, r: 3 },
    { x: 22, y: 92, w: 16, h: 10, r: 3 },
    { x: 45, y: 92, w: 12, h: 10, r: 3 },
    { x: 68, y: 92, w: 22, h: 10, r: 3 },
    { x: 4, y: 114, w: 13, h: 10, r: 3 },
    { x: 22, y: 114, w: 20, h: 10, r: 3 },
    { x: 45, y: 114, w: 14, h: 10, r: 3 },
    { x: 68, y: 114, w: 16, h: 10, r: 3 },
  ],
};

const navBones: SkeletonResult = {
  name: "sidebar-nav",
  viewportWidth: 400,
  width: 400,
  height: 300,
  bones: [
    { x: 4, y: 8, w: 50, h: 18, r: 4 },
    { x: 4, y: 42, w: 90, h: 36, r: 8, c: true },
    { x: 8, y: 50, w: 6, h: 20, r: "50%" },
    { x: 18, y: 52, w: 35, h: 14, r: 4 },
    { x: 4, y: 90, w: 90, h: 36, r: 8, c: true },
    { x: 8, y: 98, w: 6, h: 20, r: "50%" },
    { x: 18, y: 100, w: 28, h: 14, r: 4 },
    { x: 4, y: 138, w: 90, h: 36, r: 8, c: true },
    { x: 8, y: 146, w: 6, h: 20, r: "50%" },
    { x: 18, y: 148, w: 40, h: 14, r: 4 },
    { x: 4, y: 186, w: 90, h: 36, r: 8, c: true },
    { x: 8, y: 194, w: 6, h: 20, r: "50%" },
    { x: 18, y: 196, w: 32, h: 14, r: 4 },
    { x: 4, y: 240, w: 40, h: 12, r: 4 },
    { x: 4, y: 264, w: 60, h: 12, r: 4 },
  ],
};

// Register all demo bones
registerBones({
  "blog-card": blogCardBones,
  "profile-card": profileCardBones,
  "stats-card": statsCardBones,
  "chat-messages": chatBones,
  "data-table": tableBones,
  "sidebar-nav": navBones,
});
</script>

<template>
  <div class="header">
    <h1>boneyard-vue</h1>
    <p>Pixel-perfect skeleton loading screens for Vue 3</p>
  </div>

  <div class="controls">
    <button :class="{ active: loading }" @click="toggleLoading">
      {{ loading ? "Loading: ON" : "Loading: OFF" }}
    </button>
    <button @click="simulateFetch">Simulate 2s Fetch</button>
    <button :class="{ active: animate }" @click="toggleAnimate">
      {{ animate ? "Animate: ON" : "Animate: OFF" }}
    </button>
    <button :class="{ active: darkMode }" @click="toggleDark">
      {{ darkMode ? "Dark Mode: ON" : "Dark Mode: OFF" }}
    </button>
  </div>

  <div class="grid">
    <!-- Blog Card -->
    <div class="demo-card">
      <div class="demo-label">Blog Card</div>
      <BoneyardSkeleton name="blog-card" :loading="loading" :animate="animate">
        <div>
          <div
            style="
              width: 100%;
              height: 160px;
              background: linear-gradient(135deg, #667eea, #764ba2);
              border-radius: 8px;
              margin-bottom: 12px;
            "
          />
          <h3 style="margin-bottom: 8px">Getting Started with Vue 3</h3>
          <p style="color: #666; font-size: 14px; margin-bottom: 8px">
            Learn the Composition API, reactive refs, and modern Vue patterns for building scalable
            applications.
          </p>
          <span style="color: #999; font-size: 12px">5 min read</span>
        </div>
      </BoneyardSkeleton>
    </div>

    <!-- Profile Card -->
    <div class="demo-card">
      <div class="demo-label">Profile Card</div>
      <BoneyardSkeleton name="profile-card" :loading="loading" :animate="animate">
        <div style="display: flex; gap: 16px; align-items: center; padding: 12px 0">
          <div
            style="
              width: 64px;
              height: 64px;
              border-radius: 50%;
              background: linear-gradient(135deg, #f093fb, #f5576c);
              flex-shrink: 0;
            "
          />
          <div style="flex: 1">
            <h4>Sarah Chen</h4>
            <p style="color: #666; font-size: 14px">Senior Frontend Engineer</p>
            <span style="color: #999; font-size: 12px">San Francisco, CA</span>
          </div>
          <button
            style="
              padding: 6px 16px;
              border-radius: 6px;
              border: 1px solid #ddd;
              background: white;
              cursor: pointer;
            "
          >
            Follow
          </button>
        </div>
      </BoneyardSkeleton>
    </div>

    <!-- Stats Card -->
    <div class="demo-card">
      <div class="demo-label">Stats Card</div>
      <BoneyardSkeleton name="stats-card" :loading="loading" :animate="animate">
        <div style="padding: 12px 0">
          <span style="color: #999; font-size: 12px; text-transform: uppercase">Total Revenue</span>
          <h2 style="font-size: 28px; margin: 4px 0">$48,352.00</h2>
          <div style="display: flex; align-items: center; gap: 4px">
            <span style="color: #10b981; font-size: 14px">+12.5%</span>
            <span style="color: #999; font-size: 14px">vs last month</span>
          </div>
        </div>
      </BoneyardSkeleton>
    </div>

    <!-- Chat Messages -->
    <div class="demo-card">
      <div class="demo-label">Chat Messages</div>
      <BoneyardSkeleton name="chat-messages" :loading="loading" :animate="animate">
        <div style="display: flex; flex-direction: column; gap: 12px; padding: 8px 0">
          <div style="display: flex; gap: 8px; align-items: flex-start">
            <div
              style="
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: #667eea;
                flex-shrink: 0;
              "
            />
            <div style="background: #f0f0f0; padding: 8px 12px; border-radius: 12px">
              Hey, how's the project going?
            </div>
          </div>
          <div style="display: flex; gap: 8px; align-items: flex-start; justify-content: flex-end">
            <div style="background: #667eea; color: white; padding: 8px 12px; border-radius: 12px">
              Great! Just finished the skeleton component
            </div>
            <div
              style="
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: #f5576c;
                flex-shrink: 0;
              "
            />
          </div>
          <div style="display: flex; gap: 8px; align-items: flex-start">
            <div
              style="
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: #667eea;
                flex-shrink: 0;
              "
            />
            <div style="background: #f0f0f0; padding: 8px 12px; border-radius: 12px">
              Nice work!
            </div>
          </div>
        </div>
      </BoneyardSkeleton>
    </div>

    <!-- Data Table -->
    <div class="demo-card">
      <div class="demo-label">Data Table</div>
      <BoneyardSkeleton name="data-table" :loading="loading" :animate="animate">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px">
          <thead>
            <tr style="background: #f9fafb; border-bottom: 1px solid #eee">
              <th style="padding: 10px; text-align: left">Name</th>
              <th style="padding: 10px; text-align: left">Email</th>
              <th style="padding: 10px; text-align: left">Role</th>
              <th style="padding: 10px; text-align: left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #f0f0f0">
              <td style="padding: 10px">Alice</td>
              <td style="padding: 10px">alice@co.dev</td>
              <td style="padding: 10px">Admin</td>
              <td style="padding: 10px">Active</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0">
              <td style="padding: 10px">Bob</td>
              <td style="padding: 10px">bob@co.dev</td>
              <td style="padding: 10px">Editor</td>
              <td style="padding: 10px">Active</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0">
              <td style="padding: 10px">Carol</td>
              <td style="padding: 10px">carol@co.dev</td>
              <td style="padding: 10px">Viewer</td>
              <td style="padding: 10px">Inactive</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0">
              <td style="padding: 10px">Dave</td>
              <td style="padding: 10px">dave@co.dev</td>
              <td style="padding: 10px">Editor</td>
              <td style="padding: 10px">Active</td>
            </tr>
          </tbody>
        </table>
      </BoneyardSkeleton>
    </div>

    <!-- Sidebar Nav -->
    <div class="demo-card">
      <div class="demo-label">Sidebar Navigation</div>
      <BoneyardSkeleton name="sidebar-nav" :loading="loading" :animate="animate">
        <div style="padding: 8px 0">
          <h4 style="margin-bottom: 16px; color: #333">Dashboard</h4>
          <div style="display: flex; flex-direction: column; gap: 4px">
            <div
              style="
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px;
                border-radius: 8px;
                background: #f0f0ff;
              "
            >
              <div style="width: 20px; height: 20px; border-radius: 50%; background: #667eea"></div>
              <span>Overview</span>
            </div>
            <div
              style="
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px;
                border-radius: 8px;
              "
            >
              <div style="width: 20px; height: 20px; border-radius: 50%; background: #ccc"></div>
              <span>Analytics</span>
            </div>
            <div
              style="
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px;
                border-radius: 8px;
              "
            >
              <div style="width: 20px; height: 20px; border-radius: 50%; background: #ccc"></div>
              <span>Notifications</span>
            </div>
            <div
              style="
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px;
                border-radius: 8px;
              "
            >
              <div style="width: 20px; height: 20px; border-radius: 50%; background: #ccc"></div>
              <span>Settings</span>
            </div>
          </div>
          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee">
            <span style="font-size: 12px; color: #999">v1.0.0</span>
          </div>
        </div>
      </BoneyardSkeleton>
    </div>
  </div>
</template>
