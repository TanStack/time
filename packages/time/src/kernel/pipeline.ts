import type {
  Contribution,
  KernelEvent,
  ProjectionModuleStageName,
  ProjectionStage,
  TransformStage,
  ValidateStage,
  WriteTransformStageName,
  WriteValidateStageName,
} from "./types";

interface Entry<T> {
  priority: number;
  run: T;
}

function insertByPriority<T>(bucket: Array<Entry<T>>, entry: Entry<T>) {
  let i = bucket.length;
  while (i > 0 && bucket[i - 1]!.priority > entry.priority) {
    i--;
  }
  bucket.splice(i, 0, entry);
}

export class StageRegistry<E extends KernelEvent> {
  private projection = new Map<
    ProjectionModuleStageName,
    Array<Entry<ProjectionStage<E>>>
  >();
  private transform = new Map<
    WriteTransformStageName,
    Array<Entry<TransformStage<E>>>
  >();
  private validate = new Map<
    WriteValidateStageName,
    Array<Entry<ValidateStage<E>>>
  >();

  add(contribution: Contribution<E>) {
    const priority = contribution.priority ?? 0;

    if (contribution.pipeline === "projection") {
      insertByPriority(this.bucket(this.projection, contribution.stage), {
        priority,
        run: contribution.run,
      });
      return;
    }

    if (contribution.kind === "transform") {
      insertByPriority(this.bucket(this.transform, contribution.stage), {
        priority,
        run: contribution.run,
      });
      return;
    }

    insertByPriority(this.bucket(this.validate, contribution.stage), {
      priority,
      run: contribution.run,
    });
  }

  projectionStages(
    stage: ProjectionModuleStageName,
  ): Array<ProjectionStage<E>> {
    return (this.projection.get(stage) ?? []).map((e) => e.run);
  }

  transformStages(stage: WriteTransformStageName): Array<TransformStage<E>> {
    return (this.transform.get(stage) ?? []).map((e) => e.run);
  }

  validateStages(stage: WriteValidateStageName): Array<ValidateStage<E>> {
    return (this.validate.get(stage) ?? []).map((e) => e.run);
  }

  private bucket<K, T>(map: Map<K, Array<Entry<T>>>, key: K): Array<Entry<T>> {
    let existing = map.get(key);
    if (!existing) {
      existing = [];
      map.set(key, existing);
    }
    return existing;
  }
}
