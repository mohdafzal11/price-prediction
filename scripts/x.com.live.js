// ==UserScript==
// @name         DroomMarket Twitter Feed
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Display tweets from DroomMarket API in the marketActivity section on Binance
// @match        https://www.binance.com/en/trade/*
// @grant        GM_xmlhttpRequest
// @connect      *
// ==/UserScript==

(function() {
    'use strict';

    // Configuration
    const API_URL = window.location.origin.includes('localhost') ? 'http://localhost:3000/api/tweets' : 'https://droomdroom.com/price/api/tweets';
    const REFRESH_INTERVAL = 60000; // Refresh tweets every minute
    const TWEETS_TO_DISPLAY = 10; // Number of tweets to display

    // Utility functions
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Function to create a data URL for an image to bypass CSP restrictions
    function getDefaultProfileImage() {
        // Default profile image as base64
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJkSURBVHgB7VZNbtpQEJ55z0ZUqipZwG7YECLlBOYG+ATYJxA3gBNQTlBOEDhBOUGaE+AbkBMgVqjdVN1Uaot4b2aMTfgxCU7UqF3kk4xn5s33zczz84A99thVEFrC5VmQJckJAB0C0JFyPEDo8bM7Ire2ntdq9y0BuDwPMiQZIsgJIBwjQI+3HCiXy+g4DhqGgUTEa0RERAREYJ7P53C/34fZbFbIIfCYAHqWZd3aBnB1FRwTppcg8JmJnVf7tm3D8fExHBwcqHW1D4dDGAwGMJ1OC3kQ8MK27W/FAC7Og5AQvuR7LhaLBXieB57nged6oJSCOI5hPB5DEAQQhiFMJpOVGgj4RYAvbNv5XgjgR3gWEtFnJnZXSXzfh9PTUzg6OlplXsLDw0OuiiiK4P7+HqIo0ksmoiHv+WTb7nUugMuzgJDo25q8Qr/fh16vB51OB5rNpgqeJAkkSQJxHEMURbqGNBE1CdV6QpQD0CdEuL29VZ1Pp1N4fHxcBWWiKIogDEMIggCm02khBwY6IqJvuQDkgJHDRo7aF/JOp7MiLpG3Wi3odrtQq9XUXs6CnBE5M4V8BLzUAORQkQNGiOWQkV9OiOVMkHNBzgc5J+S8kHND8hDJRSSXkVxIxXwEvNQA5BCQQ0AOAjkM5FCQw0EOCTks5NCQw0MOETlMJBfJR8BLDUAOATkE5CCQw0AOBTkc5JCQw0IODTk85BCRw0RyaQr5CHipAWRnQHYIZKdAdgxk50B2EGQnQXYUZGdBdhj+y2n4lI+Al/8A2GPHcQ9/ASEtqiX/JmTgAAAAAElFTkSuQmCC';
    }

    function createTweetElement(tweet) {
        const tweetContainer = document.createElement('div');
        tweetContainer.className = 'droom-tweet';
        tweetContainer.style.padding = '12px';
        tweetContainer.style.borderBottom = '1px solid var(--color-Line)';
        tweetContainer.style.fontSize = '14px';

        // Tweet header with user info and date
        const tweetHeader = document.createElement('div');
        tweetHeader.style.display = 'flex';
        tweetHeader.style.justifyContent = 'space-between';
        tweetHeader.style.alignItems = 'center';
        tweetHeader.style.marginBottom = '8px';

        // User info with profile pic and name
        const userInfo = document.createElement('div');
        userInfo.style.display = 'flex';
        userInfo.style.alignItems = 'center';

        // Use a base64 encoded image to bypass CSP restrictions
        const profilePic = document.createElement('img');
        // Always use the DroomDroom profile picture
        profilePic.src = 'data:image/jpeg;base64,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';
        profilePic.style.width = '24px';
        profilePic.style.height = '24px';
        profilePic.style.borderRadius = '50%';
        profilePic.style.marginRight = '8px';

        const userName = document.createElement('span');
        userName.textContent = "DroomDroom";
        userName.style.fontWeight = 'bold';
        userName.style.color = 'var(--color-PrimaryText)';
        // decrease font size
        userName.style.fontSize = '12px';

        const userHandle = document.createElement('span');
        userHandle.textContent = ` @droomdroom`;
        userHandle.style.color = 'var(--color-TertiaryText)';
        userHandle.style.marginLeft = '4px';

        userInfo.appendChild(profilePic);
        userInfo.appendChild(userName);
        userInfo.appendChild(userHandle);

        // Tweet date
        const tweetDate = document.createElement('span');
        tweetDate.textContent = formatDate(tweet.time);
        tweetDate.style.color = 'var(--color-TertiaryText)';
        tweetDate.style.fontSize = '12px';

        tweetHeader.appendChild(userInfo);
        tweetHeader.appendChild(tweetDate);

        // Tweet content
        const tweetContent = document.createElement('div');
        tweetContent.textContent = tweet.text;
        tweetContent.style.color = 'var(--color-PrimaryText)';
        tweetContent.style.lineHeight = '1.4';
        tweetContent.style.marginBottom = '8px';

        // Tweet metrics (likes, retweets)
        const tweetMetrics = document.createElement('div');
        tweetMetrics.style.display = 'flex';
        tweetMetrics.style.gap = '16px';
        tweetMetrics.style.color = 'var(--color-TertiaryText)';
        tweetMetrics.style.fontSize = '12px';

        const likes = document.createElement('span');
        likes.innerHTML = `❤️ ${tweet.likes || 0}`;

        const retweets = document.createElement('span');
        retweets.innerHTML = `🔄 ${tweet.retweets || 0}`;

        tweetMetrics.appendChild(likes);
        tweetMetrics.appendChild(retweets);

        // Assemble the tweet
        tweetContainer.appendChild(tweetHeader);
        tweetContainer.appendChild(tweetContent);
        tweetContainer.appendChild(tweetMetrics);

        return tweetContainer;
    }

    function createTweetsContainer() {
        const container = document.createElement('div');
        container.id = 'droom-tweets-container';
        container.style.height = '100%';
        container.style.overflow = 'auto';
        container.style.backgroundColor = 'var(--color-BasicBg)';
        container.style.borderRadius = '8px';
        container.style.color = 'var(--color-PrimaryText)';
        container.style.scrollbarWidth = 'none'; // Firefox
        container.style.msOverflowStyle = 'none'; // IE/Edge
        container.style.setProperty('-webkit-overflow-scrolling', 'touch');
        container.style.setProperty('&::-webkit-scrollbar', 'display: none;'); // Chrome/Safari

        // Header
        const header = document.createElement('div');
        header.style.padding = '16px';
        header.style.borderBottom = '1px solid var(--color-Line)';
        header.style.fontWeight = 'bold';
        header.style.fontSize = '16px';
        header.style.display = 'flex';
        header.style.alignItems = 'center';

        const twitterIcon = document.createElement('span');
        twitterIcon.innerHTML = '𝕏';
        twitterIcon.style.marginRight = '8px';
        twitterIcon.style.fontSize = '18px';
        twitterIcon.style.color = 'var(--color-PrimaryText)';

        const headerText = document.createElement('span');
        headerText.textContent = 'Latest Tweets From DroomDroom';

        header.appendChild(twitterIcon);
        header.appendChild(headerText);

        // Tweets list
        const tweetsList = document.createElement('div');
        tweetsList.id = 'droom-tweets-list';
        tweetsList.style.height = 'calc(100% - 53px)';
        tweetsList.style.overflow = 'auto';
        tweetsList.style.scrollbarWidth = 'none'; // Firefox
        tweetsList.style.msOverflowStyle = 'none'; // IE/Edge
        tweetsList.style.setProperty('-webkit-overflow-scrolling', 'touch');
        // Add a style tag to handle webkit scrollbar which can't be set directly via style property
        const styleTag = document.createElement('style');
        styleTag.textContent = `
            #droom-tweets-list::-webkit-scrollbar {
                display: none;
            }
            #droom-tweets-container::-webkit-scrollbar {
                display: none;
            }
        `;
        document.head.appendChild(styleTag);

        // Loading indicator
        const loading = document.createElement('div');
        loading.id = 'droom-tweets-loading';
        loading.textContent = 'Loading tweets...';
        loading.style.padding = '16px';
        loading.style.textAlign = 'center';
        loading.style.color = 'var(--color-TertiaryText)';

        tweetsList.appendChild(loading);

        container.appendChild(header);
        container.appendChild(tweetsList);

        return container;
    }

    function addDroomBranding() {
        // Get the header element
        const header = document.getElementById('__APP_HEADER');

        // Only proceed if header exists and we haven't added our branding yet
        if (header && !document.getElementById('droom-header-logo')) {
            // First, let's modify the header to make room for our logo
            header.style.position = 'relative';
            // header.style.marginBottom = '10px';

            
            // Create a container for our logo that will be centered
            const logoContainer = document.createElement('div');
            
            logoContainer.id = 'droom-header-logo';
            logoContainer.style.position = 'absolute';
            logoContainer.style.left = '50%';
            logoContainer.style.top = '50%';
            logoContainer.style.transform = 'translate(-50%, -50%)';
            logoContainer.style.zIndex = '1000';
            logoContainer.style.height = '30px';

            // Create the logo image
            const logo = document.createElement('img');
            logo.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjE3IiBoZWlnaHQ9Ijg4IiB2aWV3Qm94PSIwIDAgNjE3IDg4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxzY3JpcHQgeG1sbnM9IiIvPgo8cGF0aCBkPSJNNy4xNiA2OC44NTMzQzEzLjAyNjcgNjUuNDQgMTMuNjY2NyA1OC41MDY3IDEzLjY2NjcgNDkuNjUzM0MxMy42NjY3IDQ5LjU0NjcgMTMuNjY2NyA0OS40NCAxMy42NjY3IDQ5LjQ0QzEyLjgxMzMgNDkuNDQgMTEuODUzMyA0OS40NCAxMSA0OS40NEM2LjczMzMzIDQ5LjQ0IDQuNiA1MS43ODY3IDQuOTIgNTUuNTJIMi44OTMzM0MxLjgyNjY3IDUzLjYgMS4yOTMzMyA1MS40NjY3IDEuMjkzMzMgNDkuMzMzM0MxLjI5MzMzIDQxLjAxMzMgNi45NDY2NyAzOC40NTMzIDEzLjY2NjcgMzcuMzg2N0MxMy42NjY3IDM2LjUzMzMgMTMuNjY2NyAzNS42OCAxMy42NjY3IDM0LjgyNjdDMTMuNjY2NyAyOC41MzMzIDE2LjQ0IDI2LjA4IDIwLjI4IDIzLjYyNjdMMjguNzA2NyAxOC4wOEgxMy44OEM1LjI0IDE4LjA4IDUuMjQgNy42MjY2NiA3LjE2IDAuMjY2NjYzTDkuNTA2NjcgMC4zNzMzMjlDMTAuMTQ2NyAzLjc4NjY3IDEzLjEzMzMgNS4wNjY2NyAxNy4yOTMzIDUuMDY2NjdINDYuNDEzM0M2OC44MTMzIDUuMDY2NjcgNzYuNzA2NyAyMC4yMTMzIDc2LjcwNjcgNDAuNTg2N0M3Ni43MDY3IDUxLjY4IDczLjYxMzMgNjIuMzQ2NyA2OS42NjY3IDcwLjM0NjdMNDMgODUuMDY2N0MzNy42NjY3IDgxLjIyNjcgMzEuMzczMyA3OS4wOTMzIDI0LjU0NjcgNzkuMDkzM0MxNi43NiA3OS4wOTMzIDguOTczMzMgODIuMTg2NyAzLjIxMzMzIDg3LjQxMzNIMC4yMjY2NjdDNC42IDc4Ljk4NjcgMTIuMTczMyA3MS44NCAyMi40MTMzIDY4Ljk2QzI2LjU3MzMgNjQuOTA2NyAzMS4xNiA2MC45NiAzMS4xNiA1Mi45NlYzMy43NkMzMS4xNiAyNy4wNCAzMi40NCAyMS44MTMzIDM1Ljg1MzMgMTguMDhIMzIuNTQ2N0MyOS4zNDY3IDIxLjA2NjcgMjcuNDI2NyAyNC4wNTMzIDI3LjQyNjcgMjkuOTJWMzguMjRWNDkuMTJDMjcuNDI2NyA2Mi4zNDY3IDE4LjA0IDY4Ljk2IDguMTIgNzEuNDEzM0w3LjE2IDY4Ljg1MzNaTTQyLjc4NjcgNjguNjRDNDcuNjkzMyA2OS45MiA1Mi4yOCA3Mi4xNiA1Ni4yMjY3IDc1LjE0NjdDNTkuODUzMyA2Ni4yOTMzIDYyLjIgNTYuNDggNjIuMiA0NC44NTMzTDQyLjc4NjcgNTQuNzczM0M0Mi43ODY3IDU5LjM2IDQyLjc4NjcgNjQuMDUzMyA0Mi43ODY3IDY4LjY0Wk00Mi43ODY3IDE4LjE4NjdDNDIuNzg2NyAyNS4zMzMzIDQyLjc4NjcgMzIuNDggNDIuNzg2NyAzOS43MzMzTDYwLjM4NjcgMzAuNzczM0M1OC41NzMzIDI1LjIyNjcgNTUuMjY2NyAyMC45NiA0OS45MzMzIDE5LjE0NjdDNDcuNjkzMyAxOC4yOTMzIDQ1LjI0IDE4LjE4NjcgNDIuNzg2NyAxOC4xODY3Wk0zOS44IDY4QzM5LjggNTEuNTczMyAzOS44IDM1LjE0NjcgMzkuOCAxOC43MkMzNS40MjY3IDIxLjgxMzMgMzQuMTQ2NyAyNi42MTMzIDM0LjE0NjcgMzMuODY2N1Y1My4wNjY3QzM0LjE0NjcgNTkuNzg2NyAzMS4xNiA2NC4xNiAyNy43NDY3IDY3Ljc4NjdDMjkuNDUzMyA2Ny41NzMzIDMxLjI2NjcgNjcuNDY2NyAzMy4wOCA2Ny40NjY3QzM1LjMyIDY3LjQ2NjcgMzcuNTYgNjcuNjggMzkuOCA2OFpNNDIuNzg2NyA0My4xNDY3QzQyLjc4NjcgNDUuODEzMyA0Mi43ODY3IDQ4LjU4NjcgNDIuNzg2NyA1MS4zNkw2Mi4yIDQxLjU0NjdDNjEuOTg2NyAzOC43NzMzIDYxLjc3MzMgMzYuMjEzMyA2MS4yNCAzMy44NjY3TDQyLjc4NjcgNDMuMTQ2N1pNMTEzLjAyNyA3MC42NjY3TDExNS4wNTMgNzMuMDEzM0w5OS4wNTMzIDg0LjUzMzNMODcuMzIgNzUuMzZMODMuOCA3Ny45Mkw4Mi4yIDc1Ljg5MzNMODguOTIgNzEuMzA2N1Y0My4xNDY3TDg1LjI5MzMgMzguNTZMODEuMjQgNDEuMTJMNzkuNzQ2NyAzOS4wOTMzTDk0LjA0IDI5LjM4NjdMMTAxLjgyNyAzNy44MTMzTDEwOS4yOTMgMjkuMjhIMTEwLjM2QzExMS40MjcgMzAuODggMTEzLjI0IDMxLjk0NjcgMTE1LjE2IDMxLjk0NjdDMTE3LjQgMzEuOTQ2NyAxMTkuMTA3IDMwLjc3MzMgMTE5Ljk2IDI5LjI4SDEyMy4xNkMxMjEuOTg3IDQyLjUwNjcgMTE1LjggNDQuMjEzMyAxMTIuNiA0NC4yMTMzQzExMC4yNTMgNDQuMjEzMyAxMDYuNTIgNDMuMTQ2NyAxMDMgMzkuODRWNzEuMzA2N0wxMDcuMjY3IDc0LjYxMzNMMTEzLjAyNyA3MC42NjY3Wk0xNDIuOCA2Ny42OEwxNTUuMDY3IDc1Ljg5MzNWNDUuMTczM0wxNDIuOCAzNy4wNjY3VjY3LjY4Wk0xMjUuNDEzIDc2Ljg1MzNMMTIzLjYgNzQuNTA2N0wxMjkuMDQgNzAuMTMzM0MxMjkuMDQgNjAuOTYgMTI5LjA0IDUxLjc4NjcgMTI5LjA0IDQyLjYxMzNMMTUzLjA0IDI4Ljg1MzNMMTY4LjQgNDAuNTg2N1Y2OS43MDY3TDE0NC44MjcgODQuMTA2N0wxMjkuODkzIDczLjIyNjdMMTI1LjQxMyA3Ni44NTMzWk0xOTMuMTc1IDY3LjY4TDIwNS40NDIgNzUuODkzM1Y0NS4xNzMzTDE5My4xNzUgMzcuMDY2N1Y2Ny42OFpNMTc1Ljc4OCA3Ni44NTMzTDE3My45NzUgNzQuNTA2N0wxNzkuNDE1IDcwLjEzMzNDMTc5LjQxNSA2MC45NiAxNzkuNDE1IDUxLjc4NjcgMTc5LjQxNSA0Mi42MTMzTDIwMy40MTUgMjguODUzM0wyMTguNzc1IDQwLjU4NjdWNjkuNzA2N0wxOTUuMjAyIDg0LjEwNjdMMTgwLjI2OCA3My4yMjY3TDE3NS43ODggNzYuODUzM1pNMjc2LjYxNyA3Ni4xMDY3TDI2NC44ODMgODUuNkwyNTQuMzIzIDc2LjQyNjdMMjU4LjgwMyA3Mi4yNjY3VjQ2LjAyNjdMMjUxLjQ0MyAzOS4zMDY3TDI0Ni43NSA0Mi4wOFY3Mi4yNjY3TDI1MS4zMzcgNzYuNDI2N0wyNDEuMDk3IDg1LjZMMjI4LjgzIDc1Ljg5MzNMMjMyLjk5IDcyLjI2NjdWNDRMMjI4LjgzIDM5LjQxMzNMMjI0Ljc3NyA0MS45NzMzTDIyMy4yODMgMzkuODRMMjM4LjExIDI5LjcwNjdMMjQ1Ljg5NyAzOC40NTMzTDI1OS44NyAyOS43MDY3TDI3MC41MzcgMzguNzczM0wyODUuMTUgMjkuNzA2N0wyOTYuMjQzIDM5LjJMMjk5Ljc2MyAzNi40MjY3TDMwMS42ODMgMzguNjY2N0wyOTYuMzUgNDMuMDRWNjkuODEzM0wzMDEuMzYzIDc0LjgyNjdMMzA1Ljk1IDcxLjQxMzNWNzUuMzZMMjkwLjE2MyA4NS42TDI3OS42MDMgNzYuNDI2N0wyODQuMDgzIDcyLjI2NjdWNDYuMDI2N0wyNzYuNzIzIDM5LjMwNjdMMjcxLjA3IDQyLjcyVjcxLjJMMjc2LjYxNyA3Ni4xMDY3Wk0zMTguMTYgNjguODUzM0MzMjQuMDI3IDY1LjQ0IDMyNC42NjcgNTguNTA2NyAzMjQuNjY3IDQ5LjY1MzNDMzI0LjY2NyA0OS41NDY3IDMyNC42NjcgNDkuNDQgMzI0LjY2NyA0OS40NEMzMjMuODEzIDQ5LjQ0IDMyMi44NTMgNDkuNDQgMzIyIDQ5LjQ0QzMxNy43MzMgNDkuNDQgMzE1LjYgNTEuNzg2NyAzMTUuOTIgNTUuNTJIMzEzLjg5M0MzMTIuODI3IDUzLjYgMzEyLjI5MyA1MS40NjY3IDMxMi4yOTMgNDkuMzMzM0MzMTIuMjkzIDQxLjAxMzMgMzE3Ljk0NyAzOC40NTMzIDMyNC42NjcgMzcuMzg2N0MzMjQuNjY3IDM2LjUzMzMgMzI0LjY2NyAzNS42OCAzMjQuNjY3IDM0LjgyNjdDMzI0LjY2NyAyOC41MzMzIDMyNy40NCAyNi4wOCAzMzEuMjggMjMuNjI2N0wzMzkuNzA3IDE4LjA4SDMyNC44OEMzMTYuMjQgMTguMDggMzE2LjI0IDcuNjI2NjYgMzE4LjE2IDAuMjY2NjYzTDMyMC41MDcgMC4zNzMzMjlDMzIxLjE0NyAzLjc4NjY3IDMyNC4xMzMgNS4wNjY2NyAzMjguMjkzIDUuMDY2NjdIMzU3LjQxM0MzNzkuODEzIDUuMDY2NjcgMzg3LjcwNyAyMC4yMTMzIDM4Ny43MDcgNDAuNTg2N0MzODcuNzA3IDUxLjY4IDM4NC42MTMgNjIuMzQ2NyAzODAuNjY3IDcwLjM0NjdMMzU0IDg1LjA2NjdDMzQ4LjY2NyA4MS4yMjY3IDM0Mi4zNzMgNzkuMDkzMyAzMzUuNTQ3IDc5LjA5MzNDMzI3Ljc2IDc5LjA5MzMgMzE5Ljk3MyA4Mi4xODY3IDMxNC4yMTMgODcuNDEzM0gzMTEuMjI3QzMxNS42IDc4Ljk4NjcgMzIzLjE3MyA3MS44NCAzMzMuNDEzIDY4Ljk2QzMzNy41NzMgNjQuOTA2NyAzNDIuMTYgNjAuOTYgMzQyLjE2IDUyLjk2VjMzLjc2QzM0Mi4xNiAyNy4wNCAzNDMuNDQgMjEuODEzMyAzNDYuODUzIDE4LjA4SDM0My41NDdDMzQwLjM0NyAyMS4wNjY3IDMzOC40MjcgMjQuMDUzMyAzMzguNDI3IDI5LjkyVjM4LjI0VjQ5LjEyQzMzOC40MjcgNjIuMzQ2NyAzMjkuMDQgNjguOTYgMzE5LjEyIDcxLjQxMzNMMzE4LjE2IDY4Ljg1MzNaTTM1My43ODcgNjguNjRDMzU4LjY5MyA2OS45MiAzNjMuMjggNzIuMTYgMzY3LjIyNyA3NS4xNDY3QzM3MC44NTMgNjYuMjkzMyAzNzMuMiA1Ni40OCAzNzMuMiA0NC44NTMzTDM1My43ODcgNTQuNzczM0MzNTMuNzg3IDU5LjM2IDM1My43ODcgNjQuMDUzMyAzNTMuNzg3IDY4LjY0Wk0zNTMuNzg3IDE4LjE4NjdDMzUzLjc4NyAyNS4zMzMzIDM1My43ODcgMzIuNDggMzUzLjc4NyAzOS43MzMzTDM3MS4zODcgMzAuNzczM0MzNjkuNTczIDI1LjIyNjcgMzY2LjI2NyAyMC45NiAzNjAuOTMzIDE5LjE0NjdDMzU4LjY5MyAxOC4yOTMzIDM1Ni4yNCAxOC4xODY3IDM1My43ODcgMTguMTg2N1pNMzUwLjggNjhDMzUwLjggNTEuNTczMyAzNTAuOCAzNS4xNDY3IDM1MC44IDE4LjcyQzM0Ni40MjcgMjEuODEzMyAzNDUuMTQ3IDI2LjYxMzMgMzQ1LjE0NyAzMy44NjY3VjUzLjA2NjdDMzQ1LjE0NyA1OS43ODY3IDM0Mi4xNiA2NC4xNiAzMzguNzQ3IDY3Ljc4NjdDMzQwLjQ1MyA2Ny41NzMzIDM0Mi4yNjcgNjcuNDY2NyAzNDQuMDggNjcuNDY2N0MzNDYuMzIgNjcuNDY2NyAzNDguNTYgNjcuNjggMzUwLjggNjhaTTM1My43ODcgNDMuMTQ2N0MzNTMuNzg3IDQ1LjgxMzMgMzUzLjc4NyA0OC41ODY3IDM1My43ODcgNTEuMzZMMzczLjIgNDEuNTQ2N0MzNzIuOTg3IDM4Ljc3MzMgMzcyLjc3MyAzNi4yMTMzIDM3Mi4yNCAzMy44NjY3TDM1My43ODcgNDMuMTQ2N1pNNDI0LjAyNyA3MC42NjY3TDQyNi4wNTMgNzMuMDEzM0w0MTAuMDUzIDg0LjUzMzNMMzk4LjMyIDc1LjM2TDM5NC44IDc3LjkyTDM5My4yIDc1Ljg5MzNMMzk5LjkyIDcxLjMwNjdWNDMuMTQ2N0wzOTYuMjkzIDM4LjU2TDM5Mi4yNCA0MS4xMkwzOTAuNzQ3IDM5LjA5MzNMNDA1LjA0IDI5LjM4NjdMNDEyLjgyNyAzNy44MTMzTDQyMC4yOTMgMjkuMjhINDIxLjM2QzQyMi40MjcgMzAuODggNDI0LjI0IDMxLjk0NjcgNDI2LjE2IDMxLjk0NjdDNDI4LjQgMzEuOTQ2NyA0MzAuMTA3IDMwLjc3MzMgNDMwLjk2IDI5LjI4SDQzNC4xNkM0MzIuOTg3IDQyLjUwNjcgNDI2LjggNDQuMjEzMyA0MjMuNiA0NC4yMTMzQzQyMS4yNTMgNDQuMjEzMyA0MTcuNTIgNDMuMTQ2NyA0MTQgMzkuODRWNzEuMzA2N0w0MTguMjY3IDc0LjYxMzNMNDI0LjAyNyA3MC42NjY3Wk00NTMuOCA2Ny42OEw0NjYuMDY3IDc1Ljg5MzNWNDUuMTczM0w0NTMuOCAzNy4wNjY3VjY3LjY4Wk00MzYuNDEzIDc2Ljg1MzNMNDM0LjYgNzQuNTA2N0w0NDAuMDQgNzAuMTMzM0M0NDAuMDQgNjAuOTYgNDQwLjA0IDUxLjc4NjcgNDQwLjA0IDQyLjYxMzNMNDY0LjA0IDI4Ljg1MzNMNDc5LjQgNDAuNTg2N1Y2OS43MDY3TDQ1NS44MjcgODQuMTA2N0w0NDAuODkzIDczLjIyNjdMNDM2LjQxMyA3Ni44NTMzWk01MDQuMTc1IDY3LjY4TDUxNi40NDIgNzUuODkzM1Y0NS4xNzMzTDUwNC4xNzUgMzcuMDY2N1Y2Ny42OFpNNDg2Ljc4OCA3Ni44NTMzTDQ4NC45NzUgNzQuNTA2N0w0OTAuNDE1IDcwLjEzMzNDNDkwLjQxNSA2MC45NiA0OTAuNDE1IDUxLjc4NjcgNDkwLjQxNSA0Mi42MTMzTDUxNC40MTUgMjguODUzM0w1MjkuNzc1IDQwLjU4NjdWNjkuNzA2N0w1MDYuMjAyIDg0LjEwNjdMNDkxLjI2OCA3My4yMjY3TDQ4Ni43ODggNzYuODUzM1pNNTg3LjYxNyA3Ni4xMDY3TDU3NS44ODMgODUuNkw1NjUuMzIzIDc2LjQyNjdMNTY5LjgwMyA3Mi4yNjY3VjQ2LjAyNjdMNTYyLjQ0MyAzOS4zMDY3TDU1Ny43NSA0Mi4wOFY3Mi4yNjY3TDU2Mi4zMzcgNzYuNDI2N0w1NTIuMDk3IDg1LjZMNTM5LjgzIDc1Ljg5MzNMNTQzLjk5IDcyLjI2NjdWNDRMNTM5LjgzIDM5LjQxMzNMNTM1Ljc3NyA0MS45NzMzTDUzNC4yODMgMzkuODRMNTQ5LjExIDI5LjcwNjdMNTU2Ljg5NyAzOC40NTMzTDU3MC44NyAyOS43MDY3TDU4MS41MzcgMzguNzczM0w1OTYuMTUgMjkuNzA2N0w2MDcuMjQzIDM5LjJMNjEwLjc2MyAzNi40MjY3TDYxMi42ODMgMzguNjY2N0w2MDcuMzUgNDMuMDRWNjkuODEzM0w2MTIuMzYzIDc0LjgyNjdMNjE2Ljk1IDcxLjQxMzNWNzUuMzZMNjAxLjE2MyA4NS42TDU5MC42MDMgNzYuNDI2N0w1OTUuMDgzIDcyLjI2NjdWNDYuMDI2N0w1ODcuNzIzIDM5LjMwNjdMNTgyLjA3IDQyLjcyVjcxLjJMNTg3LjYxNyA3Ni4xMDY3WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+';
            logo.style.height = '100%';
            logo.alt = 'DroomDroom';
            logo.style.marginTop = '-10px';
            // Append the logo to the container
            logoContainer.appendChild(logo);

            // Append the container to the header
            header.appendChild(logoContainer);
        }

        // Remove footer
        const footer = document.getElementById('__APP_FOOTER');
        if (footer) footer.remove();

        // Hide user info div
        const userInfoDiv = document.querySelector('div[name="userinfo"]');
        if (userInfoDiv) userInfoDiv.style.display = 'none';

        // Hide header news
        const HeaderNews = document.querySelector('div[name="header"]');
        if (HeaderNews) HeaderNews.style.display = 'none';

        // Hide order form
        const OrderForm = document.querySelector('div[name="orderform"]');
        if (OrderForm) {
            OrderForm.style.display = 'none';
        }

        // Hide news items
        const newsItemTop = document.getElementsByClassName('trade-news-item');
        if (newsItemTop && newsItemTop.length > 0) {
            newsItemTop[0].style.display = 'none';
        }

        // DO NOT remove marketActivity as we'll use it to display tweets
        // const MarketActivity = document.querySelector('div[name="marketActivity"]');
        // if (MarketActivity) MarketActivity.remove();

        // Hide bottom elements
        const BottomElements = document.getElementsByClassName('bottom-0');
        if (BottomElements && BottomElements.length > 0) {
            BottomElements[BottomElements.length-1].style.display = 'none';
        }
    }

    function injectTweetsSection() {
        // Find the marketActivity section
        const marketActivitySection = document.querySelector('div[style*="grid-area: marketActivity"]');

        if (marketActivitySection && !document.getElementById('droom-tweets-container')) {
            // Clear existing content
            marketActivitySection.innerHTML = '';

            // Create and append tweets container
            const tweetsContainer = createTweetsContainer();
            marketActivitySection.appendChild(tweetsContainer);

            // Fetch tweets for the first time
            fetchTweets();
        }
    }

    function fetchTweets() {
        const tweetsList = document.getElementById('droom-tweets-list');

        if (!tweetsList) return;

        // Show loading indicator
        tweetsList.innerHTML = '<div id="droom-tweets-loading" style="padding: 16px; text-align: center; color: var(--color-TertiaryText);">Loading tweets...</div>';

        // Make API request using GM_xmlhttpRequest to handle CORS
        GM_xmlhttpRequest({
            method: 'GET',
            url: API_URL,
            responseType: 'json',
            onload: function(response) {
                if (response.status >= 200 && response.status < 300) {
                    const tweets = response.response;

                    // Clear loading indicator
                    tweetsList.innerHTML = '';

                    // Display tweets
                    if (tweets && tweets.length > 0) {
                        const tweetsToShow = tweets.slice(0, TWEETS_TO_DISPLAY);

                        tweetsToShow.forEach(tweet => {
                            const tweetElement = createTweetElement(tweet);
                            tweetsList.appendChild(tweetElement);
                        });
                    } else {
                        tweetsList.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--color-TertiaryText);">No tweets available</div>';
                    }
                } else {
                    console.error('Error fetching tweets: Status ' + response.status);
                    tweetsList.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--color-Error);">Failed to load tweets</div>';
                }
            },
            onerror: function(error) {
                console.error('Error fetching tweets:', error);
                tweetsList.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--color-Error);">Failed to load tweets</div>';
            }
        });
    }

    function fullscreenChart(){
        console.log("Attempting to fullscreen chart");
        const svgElement = document.querySelector('.chart-fullscreen-icon');
        if (svgElement) {
            try {
                // Create a standard Event instead of MouseEvent
                const clickEvent = document.createEvent('HTMLEvents');
                clickEvent.initEvent('click', true, true);
                svgElement.dispatchEvent(clickEvent);
                console.log("Dispatched click event to fullscreen icon");
            } catch (error) {
                console.error("Error clicking fullscreen icon:", error);
            }
        } else {
            console.error('SVG element not found');
        }

        const coinInfotable = document.getElementsByClassName('coinInfoTable')[0];
            // remove first 4 div elements from the coinInfoTable
            for (let i = 0; i < 4; i++) {
                coinInfotable.removeChild(coinInfotable.children[0]);
            }

        coinInfotable.style.marginBottom = '20px';
    }
    // Initialize
    function initialize() {
        // Add DroomDroom branding
        addDroomBranding();

        // Wait for page to be fully loaded before attempting to click fullscreen
        setTimeout(fullscreenChart, 1000); // Wait 8 seconds for the page to fully load

        // Check for marketActivity section and inject tweets
        injectTweetsSection();
    }

    // Run the initialization when DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Set up intervals for continuous updates
    setInterval(addDroomBranding, 2000); // Keep adding DroomDroom branding
    setInterval(injectTweetsSection, 5000); // Check for marketActivity section every 5 seconds
    setInterval(fetchTweets, REFRESH_INTERVAL); // Refresh tweets periodically
})();
