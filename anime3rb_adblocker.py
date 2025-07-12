import time
import os
import json
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException





print(r"""
                         __    _                                   
                    _wr""        "-q__                             
                 _dP                 9m_     
               _#P                     9#_                         
              d#@                       9#m                        
             d##                         ###                       
            J###                         ###L                      
            {###K                       J###K                      
            ]####K      ___aaa___      J####F                      
        __gmM######_  w#P""   ""9#m  _d#####Mmw__                  
     _g##############mZ_         __g##############m_               
   _d####M@PPPP@@M#######Mmp gm#########@@PPP9@M####m_             
  a###""          ,Z"#####@" '######"\g          ""M##m            
 J#@"             0L  "*##     ##@"  J#              *#K           
 #"               `#    "_gmwgm_~    dF               `#_          
7F                 "#_   ]#####F   _dK                 JE          
]                    *m__ ##### __g@"                   F          
                       "PJ#####LP"                                 
 `                       0######_                      '           
                       _0########_                                   
     .               _d#####^#####m__              ,               
      "*w_________am#####P"   ~9#####mw_________w*"                
          ""9@#####@M""           ""P@#####@M""          
""")

print ("by Siverslayer")

class Anime3rbAdBlocker:
    def __init__(self, headless=False):
        self.headless = headless
        self.driver = None
        self.ad_blocker_script = self.load_ad_blocker_script()
        self.setup_driver()
        
    def load_ad_blocker_script(self):
        script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ad.js')
        with open(script_path, 'r', encoding='utf-8') as f:
            content = f.read()
            script_start = content.find('(function ()')
            if script_start != -1:
                return content[script_start:]
            return content
    
    def setup_driver(self):
        """Set up the Chrome WebDriver with appropriate options"""
        options = Options()
        if self.headless:
            options.add_argument('--headless')
        
        options.add_argument('--disable-notifications')
        options.add_argument('--disable-popup-blocking')
        options.add_argument('--disable-extensions')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-gpu')
        options.add_argument('--disable-infobars')
        options.add_argument('--mute-audio')
        options.add_argument('--disable-dev-shm-usage')
        
        self.driver = webdriver.Chrome(options=options)
        self.driver.maximize_window()
        
    def inject_ad_blocker(self):
        try:
            self.driver.execute_script(self.ad_blocker_script)
            print("✅ Ad blocker script injected successfully")
            
            additional_css = """
            const style = document.createElement('style');
            style.id = 'additional-ad-blocker-style';
            style.textContent = `
                /* Block specific anime3rb elements */
                [wire\\:snapshot*="support"], 
                [wire\\:id="edkunfxlJzs2acN5L7L8"],
                div[class*="flex flex-col gap-8 text-center"],
                div[class*="bg-white dark:bg-dark-700 flex flex-col gap-8"],
                a[style*="position: absolute;width: 100vw;height: 100vh"],
                div[style*="all: unset"],
                [x-data*="support"],
                [wire\\:snapshot*="name\\":\\"support"],
                /* Block fullscreen exit prevention */
                script[src*="ad-bottom.js"],
                /* Block anti-adblock scripts */
                script[aria-hidden="true"] {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                    position: absolute !important;
                    left: -9999px !important;
                    z-index: -9999 !important;
                }
                
                /* Ensure scrolling works */
                body, html {
                    overflow: auto !important;
                    position: static !important;
                    height: auto !important;
                }
            `;
            document.head.appendChild(style);
            
            // Override functions that detect adblock
            window.a6872294892a8c = true;
            window.google_tag_manager = true;
            window.google_tag_data = true;
            
            // Block the anti-adblock timer
            const originalSetTimeout = window.setTimeout;
            window.setTimeout = function(callback, delay, ...args) {
                if (typeof callback === 'function' && callback.toString().includes('dispatchEvent') && 
                    callback.toString().includes('support')) {
                    console.debug('Blocked anti-adblock timeout');
                    return null;
                }
                return originalSetTimeout(callback, delay, ...args);
            };
            
            // Block fullscreen exit
            document.exitFullscreen = function() { 
                console.debug('Blocked exitFullscreen call');
                return Promise.resolve();
            };
            
            // Block custom events
            const originalDispatchEvent = EventTarget.prototype.dispatchEvent;
            EventTarget.prototype.dispatchEvent = function(event) {
                if (event && event.type === 'display-modal') {
                    console.debug('Blocked display-modal event');
                    return false;
                }
                return originalDispatchEvent.apply(this, arguments);
            };
            """
            self.driver.execute_script(additional_css)
            print("✅ Additional CSS and protections injected")
            
        except Exception as e:
            print(f"❌ Error injecting ad blocker script: {e}")
    
    def navigate_to(self, url):
        """Navigate to a URL and inject the ad blocker"""
        try:
            print(f"🌐 Navigating to {url}")
            self.driver.get(url)
            
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            self.inject_ad_blocker()
            
            self.setup_periodic_cleanup()
            
            print(f"✅ Successfully loaded {url} with ad blocker")
            return True
        except TimeoutException:
            print(f"❌ Timeout while loading {url}")
            return False
        except WebDriverException as e:
            print(f"❌ Error navigating to {url}: {e}")
            return False
    
    def setup_periodic_cleanup(self):
        """Set up periodic cleanup to catch dynamically injected ads"""
        cleanup_script = """
        // Set up periodic cleanup
        setInterval(() => {
            try {
                // Re-run the removeAnnoyingElements function if it exists
                if (typeof removeAnnoyingElements === 'function') {
                    removeAnnoyingElements();
                }
                
                // Remove any anti-adblock overlays
                document.querySelectorAll('[wire\\:snapshot*="support"], [wire\\:id="edkunfxlJzs2acN5L7L8"]').forEach(el => {
                    el.style.display = 'none';
                    el.style.visibility = 'hidden';
                    el.style.opacity = '0';
                    el.style.pointerEvents = 'none';
                });
                
                // Ensure body scrolling is enabled
                document.body.style.overflow = 'auto';
                document.documentElement.style.overflow = 'auto';
                
                // Block any fullscreen exit attempts
                if (document.fullscreenElement) {
                    // Prevent the site from exiting fullscreen
                    document.exitFullscreen = function() { return Promise.resolve(); };
                }
                
                console.debug('Periodic cleanup executed');
            } catch (e) {
                console.error('Error in periodic cleanup:', e);
            }
        }, 2000);
        """
        self.driver.execute_script(cleanup_script)
        print("✅ Periodic cleanup scheduled")
    
    def wait_for_user_exit(self):
        """Wait for the user to press Ctrl+C to exit"""
        try:
            print("\n🎮 Browser is now running with ad blocker active")
            print("Press Ctrl+C to exit")
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n👋 Exiting...")
            self.close()
    
    def close(self):
        """Close the browser"""
        if self.driver:
            self.driver.quit()
            self.driver = None
            print("✅ Browser closed")

def main():
    print("🚀 Starting Anime3rb Ad Blocker")
    print("This script will open anime3rb.com with ad blocking enabled")
    
    ad_blocker = Anime3rbAdBlocker(headless=False)
    
    success = ad_blocker.navigate_to("https://anime3rb.com/")
    
    if success:
        ad_blocker.wait_for_user_exit()
    else:
        print("❌ Failed to load anime3rb.com. Exiting...")
        ad_blocker.close()

if __name__ == "__main__":
    main()