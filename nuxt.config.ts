// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  modules: ["@nuxt/ui", "@nuxtjs/supabase" , '@nuxt/icon'],
  css: ["~/assets/css/main.css"],
  colorMode: {
    preference: 'dark'
  }
  supabase: {
    redirect: true,
    // url: process.env.SUPABASE_URL,
    // key: process.env.SUPABASE_KEY,
  },
  runtimeConfig: {
    public:{
      baseUrl: process.env.BASE_URL ?? "http://localhost:3000/"
    }
  }
});
