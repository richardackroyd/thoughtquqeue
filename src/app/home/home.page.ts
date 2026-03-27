import { AlertController } from '@ionic/angular';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

interface ThoughtItem {
  id: string;
  text: string;
  createdAt: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  @ViewChild('cameraInput') cameraInput?: ElementRef<HTMLInputElement>;
  @ViewChild('galleryInput') galleryInput?: ElementRef<HTMLInputElement>;

  newThought = '';
  thoughts: ThoughtItem[] = [];
  groundImageDataUrl: string | null = null;
  isGroundImageModalOpen = false;
  readonly groundSegments = Array.from({ length: 10 }, (_, index) => index + 1);

  constructor(private readonly alertController: AlertController) {}

  async ngOnInit(): Promise<void> {
    const [thoughts, groundImage] = await Promise.all([
      this.loadThoughts(),
      this.loadGroundImage(),
    ]);
    this.thoughts = thoughts;
    this.groundImageDataUrl = groundImage;
  }

  async addThought(): Promise<void> {
    const text = this.newThought.trim();
    if (!text) {
      return;
    }

    this.thoughts = [
      ...this.thoughts,
      {
        id: crypto.randomUUID(),
        text,
        createdAt: new Date().toISOString(),
      },
    ];
    this.newThought = '';
    await this.saveThoughts(this.thoughts);
  }

  async completeThought(id: string): Promise<void> {
    this.thoughts = this.thoughts.filter((item) => item.id !== id);
    await this.saveThoughts(this.thoughts);
  }

  getDisplayThoughts(): ThoughtItem[] {
    return [...this.thoughts].reverse();
  }

  isGround(item: ThoughtItem): boolean {
    return this.thoughts[0]?.id === item.id;
  }

  isCurrent(item: ThoughtItem): boolean {
    return this.thoughts[this.thoughts.length - 1]?.id === item.id;
  }

  getDepthMarkerSegment(): number {
    if (this.thoughts.length === 0) {
      return 0;
    }

    return Math.min(this.thoughts.length, 10);
  }

  getSegmentClass(segment: number): string {
    if (segment === 1) {
      return 'segment-clear';
    }

    if (segment <= 3) {
      return 'segment-green';
    }

    if (segment <= 8) {
      return 'segment-amber';
    }

    return 'segment-red';
  }

  openGroundImagePreview(): void {
    if (!this.groundImageDataUrl) {
      return;
    }

    this.isGroundImageModalOpen = true;
  }

  closeGroundImagePreview(): void {
    this.isGroundImageModalOpen = false;
  }

  async confirmResetQueue(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Reset queue?',
      message: 'This will remove all thoughts.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Reset',
          role: 'destructive',
          handler: async () => {
            this.thoughts = [];
            await this.saveThoughts(this.thoughts);
          },
        },
      ],
    });

    await alert.present();
  }

  async openSettings(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Settings',
      subHeader: 'Ground picture',
      message:
        'Set the picture that appears in the first box on the tracker when you are back to ground and all thoughts are processed.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Take photo',
          handler: () => {
            this.cameraInput?.nativeElement.click();
          },
        },
        {
          text: 'Choose existing',
          handler: () => {
            this.galleryInput?.nativeElement.click();
          },
        },
      ],
    });

    await alert.present();
  }

  async onGroundImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const dataUrl = await this.fileToDataUrl(file);
    this.groundImageDataUrl = dataUrl;
    await this.saveGroundImage(dataUrl);
    input.value = '';
  }

  private async loadThoughts(): Promise<ThoughtItem[]> {
    const db = await this.openDb();
    const tx = db.transaction('app', 'readonly');
    const store = tx.objectStore('app');
    const req = store.get('thoughts');

    return new Promise((resolve, reject) => {
      req.onsuccess = () => {
        resolve((req.result as ThoughtItem[] | undefined) ?? []);
      };
      req.onerror = () => reject(req.error);
    });
  }

  private async loadGroundImage(): Promise<string | null> {
    const db = await this.openDb();
    const tx = db.transaction('app', 'readonly');
    const store = tx.objectStore('app');
    const req = store.get('ground-image');

    return new Promise((resolve, reject) => {
      req.onsuccess = () => {
        resolve((req.result as string | undefined) ?? null);
      };
      req.onerror = () => reject(req.error);
    });
  }

  private async saveThoughts(items: ThoughtItem[]): Promise<void> {
    const db = await this.openDb();
    const tx = db.transaction('app', 'readwrite');
    const store = tx.objectStore('app');
    store.put(items, 'thoughts');

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  private async saveGroundImage(dataUrl: string): Promise<void> {
    const db = await this.openDb();
    const tx = db.transaction('app', 'readwrite');
    const store = tx.objectStore('app');
    store.put(dataUrl, 'ground-image');

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  private async fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  private async openDb(): Promise<IDBDatabase> {
    const request = indexedDB.open('thought-queue-db', 1);

    return new Promise((resolve, reject) => {
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('app')) {
          db.createObjectStore('app');
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
