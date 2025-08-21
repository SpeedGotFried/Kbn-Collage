import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// 3D Glass Effects
				glass: {
					DEFAULT: 'hsl(var(--glass-bg))',
					border: 'hsl(var(--glass-border))'
				},
				// Quantum Avatar Colors
				quantum: {
					online: 'hsl(var(--quantum-online))',
					typing: 'hsl(var(--quantum-typing))',
					offline: 'hsl(var(--quantum-offline))',
					dnd: 'hsl(var(--quantum-dnd))'
				},
				// Mood Reactive Colors
				mood: {
					happy: 'hsl(var(--mood-happy))',
					sad: 'hsl(var(--mood-sad))',
					angry: 'hsl(var(--mood-angry))',
					excited: 'hsl(var(--mood-excited))'
				}
			},
			fontFamily: {
				inter: ['Inter', 'sans-serif']
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'typing-pulse': 'typing-pulse 1s ease-in-out infinite',
				'dnd-pulse': 'dnd-pulse 2s ease-in-out infinite',
				'teleport-fly': 'teleport-fly 0.8s ease-out forwards',
				'cube-unfold': 'cube-unfold 1s ease-out forwards',
				'angry-pulse': 'angry-pulse 1.5s ease-in-out infinite',
				'excited-wave': 'excited-wave 2s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite',
				'unlock': 'unlock 0.8s ease-out forwards'
			},
			backdropBlur: {
				'glass': '10px'
			},
			boxShadow: {
				'glow': '0 0 40px hsl(var(--primary) / 0.6)',
				'quantum': '0 0 40px hsl(var(--quantum-online) / 0.4)',
				'teleport': '0 0 50px hsl(200 100% 70% / 0.6)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
