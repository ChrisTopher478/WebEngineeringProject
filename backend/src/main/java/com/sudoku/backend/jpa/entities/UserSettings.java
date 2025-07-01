package com.sudoku.backend.jpa.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_settings")
public class UserSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;
    private String userId;
    private boolean checkMistakes;
    private boolean checkDuplicates;
    private boolean highlightNumbers;
    private boolean backgroundHighlight;

    public UserSettings() {
    }

     public int getId() {
          return id;
     }

     public void setUserId(String userId) {
          this.userId = userId;
     }

    public String getUserId() {
        return userId;
    }

    public boolean getBackgroundHighlight() {
          return backgroundHighlight;
     }

     public boolean getCheckDuplicates() {
          return checkDuplicates;
     }

     public boolean getCheckMistakes() {
          return checkMistakes;
     }

     public boolean getHighlightNumbers() {
          return highlightNumbers;
     }

     public void setAll(UserSettings userSettings) {
         this.checkMistakes = userSettings.getCheckMistakes();
         this.checkDuplicates = userSettings.getCheckDuplicates();
         this.highlightNumbers = userSettings.getHighlightNumbers();
         this.backgroundHighlight = userSettings.getBackgroundHighlight();
     }
}
