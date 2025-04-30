"use client";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";

export default function Navbar() {
  return (
    <AppBar
      position="static"
      sx={{ backgroundColor: "#000000", borderBottom: "2px solid orange" }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, color: "orange" }}>
          ابزارهای رایگان هوش مصنوعی
        </Typography>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <Button
              color="inherit"
              sx={{ color: "orange", border: "1px solid orange" }}
            >
              ورود
            </Button>
          </SignInButton>
        </SignedOut>
      </Toolbar>
    </AppBar>
  );
}
