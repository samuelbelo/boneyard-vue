<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { SkeletonResult } from "../src/types.ts";
import { snapshotBones } from "../src/extract.ts";
import { registerBones } from "../src/vue.ts";

const loading = ref(false);
const darkMode = ref(false);
const animate = ref(true);

// Content refs for auto-snapshot
const blogContent = ref<HTMLElement | null>(null);
const profileContent = ref<HTMLElement | null>(null);
const statsContent = ref<HTMLElement | null>(null);
const chatContent = ref<HTMLElement | null>(null);
const tableContent = ref<HTMLElement | null>(null);
const navContent = ref<HTMLElement | null>(null);

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

// Auto-snapshot real UI on mount — same approach as the original boneyard-js demo.
// Renders content first, captures exact DOM positions via getBoundingClientRect,
// then switches to skeleton mode with pixel-perfect bone positions.
onMounted(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const refs: Record<string, HTMLElement | null> = {
        "blog-card": blogContent.value,
        "profile-card": profileContent.value,
        "stats-card": statsContent.value,
        "chat-messages": chatContent.value,
        "data-table": tableContent.value,
        "sidebar-nav": navContent.value,
      };

      const captured: Record<string, SkeletonResult> = {};
      for (const [name, el] of Object.entries(refs)) {
        if (el) {
          captured[name] = snapshotBones(el, name);
        }
      }

      registerBones(captured);
      loading.value = true;
    });
  });
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
        <div ref="blogContent">
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
        <div
          ref="profileContent"
          style="display: flex; gap: 16px; align-items: center; padding: 12px 0"
        >
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
        <div ref="statsContent" style="padding: 12px 0">
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
        <div
          ref="chatContent"
          style="display: flex; flex-direction: column; gap: 12px; padding: 8px 0"
        >
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
        <table ref="tableContent" style="width: 100%; border-collapse: collapse; font-size: 14px">
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
        <div ref="navContent" style="padding: 8px 0">
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
