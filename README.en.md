[Demo Image Click to view the effect (Due to network issues, the GIF animation may not display properly. The video-converted GIF also has lag. It is more straightforward to download the demo and run it on your computer.)](http://47.119.142.242/static/towxml-stream-typer.gif)

# towxml-stream-typewriter

> ##### For issues, contact me on WeChat: zxx-wwj-zbl &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

[Towxml Source Code & Streaming Typewriter Tutorial Video](https://www.bilibili.com/video/BV1hE3Fz8EVu/?spm_id_from=333.337.search-card.all.click&vd_source=0509c88161931dba2d7404110af17c0f)

### Background & Core Pain Points

With the popularization of large AI models in WeChat Mini Programs and cross-end scenarios, streaming Markdown output via SSE/WebSocket has become a standard feature for AI chatbots.
However, the mainstream Markdown rendering library **towxml** has critical performance issues in large-model streaming scenarios:

- Streaming rendering requires **full re-parsing + repeated re-rendering** of accumulated text; rendering overhead grows exponentially with text length.
  
- Long texts cause severe lag, device overheating, frame drops, repeated node creation, and even page freezes or Mini Program crashes due to frequent `setData` calls.
  
- Performance degrades continuously after multiple rounds of conversation, becoming a major technical bottleneck for AI chat in Mini Programs.

> 💡 If this project solved your problem, please give it a **⭐ Star** to support my work!

> Your encouragement is my biggest motivation to keep optimizing and iterating new features.

### Solution

To solve these pain points, I deeply modified the original towxml source code and built the `towxml-stream-typer` component with core breakthroughs:

✅ **Core Technical Innovation**: Two core ideas: **Partial Rendering for Incremental Text** + **Stable Node Reuse for Layout & Styles**.

Eliminates redundant parsing and rendering at the root — only new text fragments are parsed; stable rendered nodes (paragraphs, lists, code blocks) are fully reused.

✅ **Extreme Performance**: Tested on Android & iOS.
40 minutes of long text streaming maintains consistent speed.
50,000-word Markdown renders in only **4 minutes 30 seconds** (just 20s slower than theoretical limit).
200,000-word multi-round conversations show ≤ 2s time difference across rounds.
**The lagging issue is completely solved.**

Theoretically, this solution ensures **ultra-smooth rendering from start to finish**, no matter how long the text is.

### Support

This component supports:
- **Native WeChat Mini Program**
  
- **uniapp (Vue3)**
  
- **Taro**

If you enable **Code Protect** when uploading in WeChat DevTools, compilation will fail.
Solution: [Wiki - Fix Upload Failure When Code Protect Is Enabled](https://github.com/zhouzxx/towxml-stream-typer/wiki/%E8%A7%A3%E5%86%B3%E5%BE%AE%E4%BF%A1%E5%BC%80%E5%8F%91%E5%B7%A5%E5%85%B7%E4%B8%AD%E5%8B%95%E4%BB%A3%E4%BB%A3%E7%A0%81%E4%BB%A3%EF%BC%8C%E4%B8%8A%E4%BC%A0%E5%A4%B1%E8%B4%A5%E7%9A%84%E9%A2%98%E9%A2%98)

Due to underlying modular differences, **uniapp Vue2** has compatibility issues.

It can still be used with extra configuration, but uniapp Vue2 usage is rare now, so I do not provide a dedicated demo.

If you need it, contact me directly on WeChat.

### Usage

Download the `wxcomponents` folder and place it in your Mini Program or uniapp project directory — just like using the original towxml.

I have prepared two ready-to-use chat examples:

[uniapp Example](https://github.com/zhouzxx/towxml-stream-typewriter-uniapp-example)
[Native WeChat Mini Program Example](https://github.com/zhouzxx/towxml-stream-typewriter-weChat-example)

***Highly recommended: Use one of these demos as a reference.

Reading docs can be confusing — the demo code is fully commented with best practices including:

loading history messages, scrolling to bottom, stopping print, pausing auto-scroll, one-click scroll to bottom, etc.***

### Details

##### 1. Since towxml is customized, its component props have been modified

##### 2. Current Props:

| Prop Name   | Type    | Description                                                                                                                                 | Default |
|-------------|---------|---------------------------------------------------------------------------------------------------------------------------------------------|---------|
| id          | String  | Unique instance ID — **required**. Each towxml component uses its ID to manage independent global data. Duplicate IDs will cause conflicts. | —       |
| speed       | Number  | Character print interval (ms). Smaller = faster.                                                                                            | 10      |
| openTyper   | Boolean | Enable streaming typewriter effect. Disable if you want full Markdown rendered instantly.                                                    | true    |
| theme       | String  | Supports `dark` and `light`. `light` recommended.                                                                                            | light   |

##### 3. Current Events:

`finish`: Triggered when typing finishes. Use it to clear auto-scroll timers or clean up.

`historyMessageFinish`: Called when each history message finishes loading.

##### 4. Global Functions (import from `towxml/globalCb.js`)

| Function Name           | Parameters                  | Description |
|-------------------------|-----------------------------|-------------|
| setMdText               | (id, text)                  | Updates the full Markdown text for the given component ID. Call this every time new streaming data arrives. |
| setStreamFinish         | (id)                        | Notifies the component that the current AI response stream has ended. Typing will complete after the last character. |
| stopImmediatelyCb       | (id)                        | Stops typing instantly for the specified instance (e.g., when user starts a new question). |
| scrollCb                | (e)                         | Listener for `scroll` event on your `scroll-view`. Required for virtual display to save memory and prevent crashes. |
| setQueryTowxmlNodeFn    | Assign a function to `.value` | Helps the library query all towxml component positions using `createSelectorQuery` for virtual display. See demo for usage. |

> Both `scrollCb` and `setQueryTowxmlNodeFn` are required for **virtual display** to work.

> Without them, the component still works, but memory usage will grow over time and may cause WeChat to kill your Mini Program.

> When virtual display is enabled, you will see logs like this while scrolling:

> ![image](https://github.com/user-attachments/assets/08481834-b254-4cf9-9f9f-34578d4f5350)

> For full implementation details, refer to the uniapp or native WeChat demo — it’s simple.

##### 5. Updating

When the code is updated, just download the latest `towxml` folder and replace the one in your project.
If new features are added, you may need to update your demo code accordingly.
