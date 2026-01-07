export const theme = {
    colors: {
        primary: '#6C63FF',      // Vibrant Purple/Blue
        secondary: '#03DAC6',    // Teal
        background: '#F0F2F5',   // Light Gray for general background
        surface: '#FFFFFF',      // White for cards
        error: '#B00020',
        text: {
            primary: '#000000',
            secondary: '#6E6E6E',
            light: '#FFFFFF',
        },
        accent: '#FF4081',       // Pink for highlights
        border: '#E0E0E0',
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
    },
    borderRadius: {
        s: 8,
        m: 16,
        l: 24,
    },
    shadows: {
        small: {
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 2,
        },
        medium: {
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 5,
            },
            shadowOpacity: 0.15,
            shadowRadius: 6.27,
            elevation: 6,
        },
    },
    typography: {
        header: {
            fontSize: 28,
            fontWeight: 'bold',
            color: '#333',
        },
        subHeader: {
            fontSize: 20,
            fontWeight: '600',
            color: '#555',
        },
        body: {
            fontSize: 16,
            color: '#333',
        },
        caption: {
            fontSize: 14,
            color: '#777',
        }
    }
};
